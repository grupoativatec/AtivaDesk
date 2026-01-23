import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { sendNewTicketEmail } from "@/lib/email"

/**
 * POST /api/tickets/[id]/send-email
 * Envia email de notificação sobre um ticket específico
 */
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

    // Buscar ticket com todas as informações necessárias
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        openedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            url: true,
            mimeType: true,
            size: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    // Enviar email
    const result = await sendNewTicketEmail({
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      openedByName: ticket.openedBy.name,
      openedByEmail: ticket.openedBy.email,
      category: ticket.category,
      priority: ticket.priority,
      unit: ticket.unit ? String(ticket.unit) : null,
      description: ticket.description,
      attachments: ticket.attachments,
    })

    return NextResponse.json({
      ok: true,
      message: "Email enviado com sucesso",
      messageId: result.messageId,
    })
  } catch (error: any) {
    console.error("Erro ao enviar email do ticket:", error)
    return NextResponse.json(
      { 
        error: "Erro ao enviar email",
        details: error.message || "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}
