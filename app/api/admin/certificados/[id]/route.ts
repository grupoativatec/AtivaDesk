import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@/lib/generated/prisma/client"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { prisma } from "@/lib/prisma"

const updateCertificateSchema = z
  .object({
    domain: z.string().trim().min(1, "Domínio inválido").max(255).optional(),
    subdomains: z.array(z.string().trim().min(1).max(255)).optional(),
    issuedAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    pendingRenewal: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo informado para atualização.",
  })

function normalizeDomain(value: string) {
  return value.trim().toLowerCase()
}

function normalizeSubdomains(subdomains: string[]) {
  return Array.from(
    new Set(
      subdomains
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

function serializeCertificate(certificate: {
  id: string
  domain: string
  subdomains: string[]
  issuedAt: Date
  expiresAt: Date
  pendingRenewal: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: certificate.id,
    domain: certificate.domain,
    subdomains: certificate.subdomains,
    issuedAt: certificate.issuedAt.toISOString(),
    expiresAt: certificate.expiresAt.toISOString(),
    pendingRenewal: certificate.pendingRenewal,
    createdAt: certificate.createdAt.toISOString(),
    updatedAt: certificate.updatedAt.toISOString(),
  }
}

async function ensureAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    }
  }

  if (user.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem gerenciar certificados." },
        { status: 403 }
      ),
    }
  }

  return { ok: true as const }
}

/**
 * PATCH /api/admin/certificados/:id
 * Atualiza um certificado SSL
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if (!auth.ok) {
      return auth.response
    }

    const { id } = await params

    const existing = await prisma.sslCertificate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateCertificateSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const data = parsed.data

    const issuedAt = data.issuedAt ?? existing.issuedAt
    const expiresAt = data.expiresAt ?? existing.expiresAt

    if (expiresAt.getTime() <= issuedAt.getTime()) {
      return NextResponse.json(
        { error: "A data de vencimento deve ser maior que a data de emissão." },
        { status: 400 }
      )
    }

    const certificate = await prisma.sslCertificate.update({
      where: { id },
      data: {
        domain: data.domain ? normalizeDomain(data.domain) : undefined,
        subdomains: data.subdomains ? normalizeSubdomains(data.subdomains) : undefined,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        pendingRenewal: data.pendingRenewal,
      },
    })

    return NextResponse.json({
      ok: true,
      certificate: serializeCertificate(certificate),
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um certificado cadastrado para este domínio." },
        { status: 409 }
      )
    }

    console.error("Erro ao atualizar certificado:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar certificado" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/certificados/:id
 * Exclui um certificado SSL
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if (!auth.ok) {
      return auth.response
    }

    const { id } = await params

    await prisma.sslCertificate.delete({
      where: { id },
    })

    return NextResponse.json({
      ok: true,
      message: "Certificado excluído com sucesso.",
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 })
    }

    console.error("Erro ao excluir certificado:", error)
    return NextResponse.json(
      { error: "Erro interno ao excluir certificado" },
      { status: 500 }
    )
  }
}

