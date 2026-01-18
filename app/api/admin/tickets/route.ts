import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem acessar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver todos os tickets." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const category = searchParams.get("category")
    const unit = searchParams.get("unit")
    const assigneeId = searchParams.get("assigneeId")
    const search = searchParams.get("search")

    // Construir filtros
    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (priority && priority !== "all") {
      where.priority = priority
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (unit && unit !== "all") {
      where.unit = unit
    }

    if (assigneeId && assigneeId !== "all") {
      if (assigneeId === "unassigned") {
        where.assigneeId = null
      } else {
        where.assigneeId = assigneeId
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Buscar todos os tickets
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        openedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          where: {
            isInternal: false,
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
          take: 1,
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
