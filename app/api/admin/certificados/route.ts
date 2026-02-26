import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@/lib/generated/prisma/client"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { prisma } from "@/lib/prisma"

const createCertificateSchema = z.object({
  domain: z.string().trim().min(1, "Domínio é obrigatório").max(255),
  subdomains: z.array(z.string().trim().min(1).max(255)).default([]),
  issuedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  pendingRenewal: z.boolean().default(false),
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

  return { ok: true as const, user }
}

/**
 * GET /api/admin/certificados
 * Lista certificados SSL cadastrados
 */
export async function GET() {
  try {
    const auth = await ensureAdmin()
    if (!auth.ok) {
      return auth.response
    }

    const certificates = await prisma.sslCertificate.findMany({
      orderBy: [{ expiresAt: "asc" }, { domain: "asc" }],
    })

    return NextResponse.json({
      ok: true,
      certificates: certificates.map(serializeCertificate),
    })
  } catch (error) {
    console.error("Erro ao listar certificados:", error)
    return NextResponse.json(
      { error: "Erro interno ao listar certificados" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/certificados
 * Cria um novo certificado SSL
 */
export async function POST(req: Request) {
  try {
    const auth = await ensureAdmin()
    if (!auth.ok) {
      return auth.response
    }

    const body = await req.json()
    const parsed = createCertificateSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const data = parsed.data
    const issuedAt = data.issuedAt
    const expiresAt = data.expiresAt

    if (expiresAt.getTime() <= issuedAt.getTime()) {
      return NextResponse.json(
        { error: "A data de vencimento deve ser maior que a data de emissão." },
        { status: 400 }
      )
    }

    const certificate = await prisma.sslCertificate.create({
      data: {
        domain: normalizeDomain(data.domain),
        subdomains: normalizeSubdomains(data.subdomains),
        issuedAt,
        expiresAt,
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

    console.error("Erro ao criar certificado:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar certificado" },
      { status: 500 }
    )
  }
}

