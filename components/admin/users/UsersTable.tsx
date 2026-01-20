"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UsersRowActions } from "./UsersRowActions"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, Search } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface User {
  id: string
  name: string
  email: string
  role: "USER" | "AGENT" | "ADMIN"
  createdAt: string
  deletedAt: string | null
  teamMemberships?: Array<{ team: { id: string; name: string } }>
}

interface UsersTableProps {
  users: User[]
  isLoading?: boolean
  onRefresh: () => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
}

const roleLabels: Record<"USER" | "AGENT" | "ADMIN", string> = {
  USER: "Usuário",
  AGENT: "Agente",
  ADMIN: "Administrador",
}

const roleVariants: Record<"USER" | "AGENT" | "ADMIN", "default" | "secondary" | "outline"> = {
  USER: "default",
  AGENT: "secondary",
  ADMIN: "outline",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UsersTable({
  users,
  isLoading = false,
  onRefresh,
  pagination,
  onPageChange,
}: UsersTableProps) {
  const isMobile = useIsMobile()

  if (isLoading) {
    if (isMobile) {
      // Skeleton mobile com cards
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 shrink-0" />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // Skeleton desktop com tabela
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Usuário
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Email
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Cargo
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Criado em
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-8 w-8" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Nenhum usuário encontrado
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Não há usuários correspondentes aos filtros aplicados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Versão mobile com cards
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="space-y-3">
          {users.map((user) => {
            const createdAt = new Date(user.createdAt)
            const timeAgo = formatDistanceToNow(createdAt, {
              addSuffix: true,
              locale: ptBR,
            })
            const isActive = !user.deletedAt

            return (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {user.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <UsersRowActions user={user} onSuccess={onRefresh} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={roleVariants[user.role]} className="text-xs">
                        {roleLabels[user.role]}
                      </Badge>
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={`text-xs ${isActive ? "" : "opacity-60"}`}
                      >
                        {isActive ? "Ativo" : "Desativado"}
                      </Badge>
                    </div>

                    {user.role === "ADMIN" && user.teamMemberships && user.teamMemberships.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {user.teamMemberships.map(({ team }) => (
                          <Badge key={team.id} variant="outline" className="text-xs">
                            {team.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Criado {timeAgo}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Paginação mobile */}
        {pagination && pagination.totalPages > 1 && (
          <div className="space-y-3">
            <div className="text-xs text-center text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages} • {pagination.total} usuários
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex-1"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex-1"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Versão desktop com tabela
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Equipe(s)
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const createdAt = new Date(user.createdAt)
                  const timeAgo = formatDistanceToNow(createdAt, {
                    addSuffix: true,
                    locale: ptBR,
                  })
                  const isActive = !user.deletedAt

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-foreground">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge variant={roleVariants[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={isActive ? "" : "opacity-60"}
                        >
                          {isActive ? "Ativo" : "Desativado"}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        {user.role === "ADMIN" ? (
                          user.teamMemberships && user.teamMemberships.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.teamMemberships.map(({ team }) => (
                                <Badge key={team.id} variant="outline" className="text-xs">
                                  {team.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="text-sm text-muted-foreground">
                          {timeAgo}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <UsersRowActions user={user} onSuccess={onRefresh} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação desktop */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
            {pagination.total} usuários
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
