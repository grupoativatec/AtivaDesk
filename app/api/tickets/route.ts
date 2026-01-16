import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { notifyNewTicket } from "@/lib/notifications"

const createTicketSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  category: z.enum(["HARDWARE", "SOFTWARE", "NETWORK", "EMAIL", "ACCESS", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  unit: z.enum(["ITJ", "SFS", "FOZ", "DIO", "AOL"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  attachments: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    // Buscar tickets do usuário
    const tickets = await prisma.ticket.findMany({
      where: {
        openedById: user.id,
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          where: {
            isInternal: false, // Apenas mensagens visíveis para o usuário
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 1, // Pegar apenas a última mensagem para preview
        },
        _count: {
          select: {
            messages: {
              where: {
                isInternal: false,
              },
            },
            attachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      ok: true,
      tickets,
    })
  } catch (error: any) {
    console.error("Erro ao buscar tickets:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar tickets" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = createTicketSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, category, priority, unit, description, attachments = [] } = parsed.data

    // Criar ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        category,
        priority,
        unit,
        description,
        openedById: user.id,
        attachments: attachments.length > 0 ? {
          create: attachments.map((url, index) => {
            // Extrair nome do arquivo da URL
            const filename = url.split("/").pop() || `anexo-${index + 1}`
            
            // Detectar MIME type básico pela extensão
            const extension = filename.split(".").pop()?.toLowerCase() || ""
            const mimeTypes: Record<string, string> = {
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              png: "image/png",
              gif: "image/gif",
              webp: "image/webp",
              pdf: "application/pdf",
              doc: "application/msword",
              docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }
            const mimeType = mimeTypes[extension] || "application/octet-stream"

            return {
              filename,
              url,
              mimeType,
              size: 0, // Tamanho será obtido do arquivo quando necessário
            }
          }),
        } : undefined,
      },
      include: {
        openedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Criar notificação para todos os admins (em background, não bloqueia a resposta)
    notifyNewTicket(ticket.id, ticket.title, ticket.openedBy.name).catch((err) => {
      console.error("Erro ao criar notificação de novo ticket:", err)
    })

    return NextResponse.json({
      ok: true,
      ticket,
    })
  } catch (error: any) {
    console.error("Erro ao criar ticket:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar ticket" },
      { status: 500 }
    )
  }
}
