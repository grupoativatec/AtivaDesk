"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AcessosRowActions } from "./AcessosRowActions"
import { Search, Mail, Tag, Briefcase } from "lucide-react"
import { PasswordReveal } from "./PasswordReveal"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface AcessoExterno {
  id: string
  nome: string
  usuario: string | null
  email: string | null
  senha: string | null
  departamento: string | null
  categoriaId: string | null
  categoria: {
    id: string
    nome: string
  } | null
  ativo: boolean
  createdAt: string
  updatedAt: string
  registradoPor: {
    id: string
    name: string
    email: string
  } | null
}

interface AcessosTableProps {
  acessos: AcessoExterno[]
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

function getInitials(nome: string): string {
  return nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}


export function AcessosTable({
  acessos,
  isLoading = false,
  onRefresh,
  pagination,
  onPageChange,
}: AcessosTableProps) {
  const isMobile = useIsMobile()

  if (isLoading) {
    if (isMobile) {
      return (
        <div className="space-y-0 border rounded-lg overflow-hidden bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "px-4 py-3 border-b last:border-b-0",
                i === 4 && "border-b-0"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 flex-1">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 shrink-0" />
              </div>
              <div className="ml-[2.25rem] space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Nome
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Usuário
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Email
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Departamento
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Categoria
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Senha
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Status
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
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
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

  if (acessos.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Nenhum acesso encontrado
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Não há acessos externos correspondentes aos filtros aplicados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Versão mobile com lista organizada
  if (isMobile) {
    return (
      <div className="space-y-0 border rounded-lg overflow-hidden bg-card">
        {acessos.map((acesso) => {
          const isActive = acesso.ativo

          return (
            <div
              key={acesso.id}
              className={cn(
                "px-4 py-3 border-b last:border-b-0",
                "hover:bg-muted/30 transition-colors"
              )}
            >
              {/* Linha principal: Nome e Ações */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(acesso.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-foreground truncate">
                      {acesso.nome}
                    </div>
                    {acesso.usuario && (
                      <div className="text-xs text-muted-foreground truncate">
                        @{acesso.usuario}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4",
                          !isActive && "opacity-60"
                        )}
                      >
                        {isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      {acesso.categoria && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30"
                        >
                          {acesso.categoria.nome}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <AcessosRowActions acesso={acesso} onSuccess={onRefresh} />
                </div>
              </div>

              {/* Informações secundárias */}
              <div className="ml-[2.25rem] space-y-1.5 text-xs">
                {acesso.departamento && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="size-3 shrink-0" />
                    <span className="truncate">{acesso.departamento}</span>
                  </div>
                )}
                {acesso.email && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    <span className="truncate">{acesso.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="font-medium shrink-0">Senha:</span>
                  <PasswordReveal
                    acessoId={acesso.id}
                    hasPassword={!!acesso.senha}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Versão desktop com tabela
  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Nome
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Usuário
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Email
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Departamento
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Categoria
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Senha
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {acessos.map((acesso) => {
                  const isActive = acesso.ativo

                  return (
                    <tr key={acesso.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">
                              {getInitials(acesso.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">
                              {acesso.nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="text-sm text-foreground">
                          {acesso.usuario ? (
                            <span className="text-muted-foreground">@{acesso.usuario}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="text-sm text-foreground">
                          {acesso.email || "-"}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="text-sm text-foreground">
                          {acesso.departamento || "-"}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        {acesso.categoria ? (
                          <Badge variant="secondary" className="text-xs">
                            {acesso.categoria.nome}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <PasswordReveal
                          acessoId={acesso.id}
                          hasPassword={!!acesso.senha}
                        />
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={cn("text-xs", !isActive && "opacity-60")}
                        >
                          {isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <AcessosRowActions acesso={acesso} onSuccess={onRefresh} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4 bg-card rounded-lg border shadow-sm p-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
            {pagination.total} acessos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-8 sm:h-9"
            >
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground px-2">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="h-8 sm:h-9"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
