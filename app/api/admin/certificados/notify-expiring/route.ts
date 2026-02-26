import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { prisma } from "@/lib/prisma"
import { sendExpiringCertificatesEmail } from "@/lib/email"

const DEFAULT_THRESHOLD_DAYS = 5

function isCronAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return false
  }

  const headerToken = req.headers.get("x-cron-secret")
  const bearerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")

  return headerToken === cronSecret || bearerToken === cronSecret
}

async function isAdminAuthorized(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user && user.role === "ADMIN"
}

/**
 * POST /api/admin/certificados/notify-expiring
 * Executa varredura e envia e-mail para certificados vencendo em menos de X dias
 */
export async function POST(req: Request) {
  try {
    const adminAuthorized = await isAdminAuthorized()
    const cronAuthorized = isCronAuthorized(req)

    if (!adminAuthorized && !cronAuthorized) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    let requestedThreshold: number | undefined
    try {
      const body = await req.json()
      if (typeof body?.daysThreshold === "number") {
        requestedThreshold = body.daysThreshold
      }
    } catch {
      // body opcional
    }

    const daysThreshold = Number.isFinite(requestedThreshold)
      ? Math.max(1, Math.min(30, Number(requestedThreshold)))
      : DEFAULT_THRESHOLD_DAYS

    const now = new Date()
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000)

    const candidateCertificates = await prisma.sslCertificate.findMany({
      where: {
        expiresAt: {
          gte: now,
          lt: thresholdDate,
        },
      },
      orderBy: {
        expiresAt: "asc",
      },
    })

    const certificatesToNotify = candidateCertificates.filter((certificate) => {
      if (!certificate.lastExpiryAlertFor) {
        return true
      }

      return certificate.lastExpiryAlertFor.getTime() !== certificate.expiresAt.getTime()
    })

    if (certificatesToNotify.length === 0) {
      return NextResponse.json({
        ok: true,
        sent: 0,
        thresholdDays: daysThreshold,
        message: "Nenhum certificado novo para notificação no período.",
      })
    }

    await sendExpiringCertificatesEmail({
      certificates: certificatesToNotify.map((certificate) => ({
        id: certificate.id,
        domain: certificate.domain,
        expiresAt: certificate.expiresAt,
        pendingRenewal: certificate.pendingRenewal,
      })),
      daysThreshold,
    })

    const sentAt = new Date()
    await prisma.$transaction(
      certificatesToNotify.map((certificate) =>
        prisma.sslCertificate.update({
          where: { id: certificate.id },
          data: {
            lastExpiryAlertFor: certificate.expiresAt,
            lastExpiryAlertSentAt: sentAt,
          },
        })
      )
    )

    return NextResponse.json({
      ok: true,
      sent: certificatesToNotify.length,
      thresholdDays: daysThreshold,
      domains: certificatesToNotify.map((certificate) => certificate.domain),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao executar notificação de certificados"
    console.error("Erro ao notificar certificados próximos do vencimento:", error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
