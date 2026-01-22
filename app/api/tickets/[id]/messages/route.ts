import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { notifyNewMessage } from "@/lib/notifications"

const createMessageSchema = z.object({
  content: z.string().min(1, "Mensagem não pode estar vazia"),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { id: ticketId } = await params

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    // Verificar permissão: Admins podem enviar para qualquer ticket
    // Usuários normais só podem enviar para seus próprios tickets
    if (user.role !== "ADMIN" && ticket.openedById !== user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para enviar mensagens neste ticket" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }

    const { content } = parsed.data

    // Criar mensagem
    const message = await prisma.ticketMessage.create({
      data: {
        ticket: {
          connect: {
            id: ticketId,
          },
        },
        author: {
          connect: {
            id: user.id,
          },
        },
        content,
        isInternal: false,
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
    })

    // Criar notificação para admins (em background, não bloqueia a resposta)
    // Buscar informações do ticket para a notificação
    const ticketForNotification = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { title: true },
    })

    if (ticketForNotification) {
      notifyNewMessage(
        ticketId,
        ticketForNotification.title,
        user.id,
        message.author.name,
        user.role === "ADMIN"
      ).catch((err) => {
        console.error("Erro ao criar notificação de nova mensagem:", err)
      })
    }

    return NextResponse.json({
      ok: true,
      message,
    })
  } catch (error: any) {
    console.error("Erro ao criar mensagem:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar mensagem" },
      { status: 500 }
    )
  }
}
