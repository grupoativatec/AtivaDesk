"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ColaboradoresRowActions } from "./ColaboradoresRowActions"
import { Search, Mail, Tag, Briefcase } from "lucide-react"
import { PasswordReveal } from "./PasswordReveal"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ColaboradorExterno {
  id: string
  nome: string
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

interface ColaboradoresTableProps {
  colaboradores: ColaboradorExterno[]
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


export function ColaboradoresTable({
  colaboradores,
  isLoading = false,
  onRefresh,
  pagination,
  onPageChange,
}: ColaboradoresTableProps) {
  const isMobile = useIsMobile()

  if (isLoading) {
    if (isMobile) {
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
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Colaborador
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Empresa
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Tempo
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Entrada
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
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <Skeleton className="h-4 w-20" />
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

  if (colaboradores.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Nenhum colaborador encontrado
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Não há colaboradores externos correspondentes aos filtros aplicados.
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
        {colaboradores.map((colaborador) => {
          const isActive = colaborador.ativo

          return (
            <Card key={colaborador.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback>
                        {getInitials(colaborador.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {colaborador.nome}
                      </h3>
                      {colaborador.departamento && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                          <Briefcase className="size-3" />
                          {colaborador.departamento}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ColaboradoresRowActions colaborador={colaborador} onSuccess={onRefresh} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={cn("text-xs", !isActive && "opacity-60")}
                    >
                      {isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    {colaborador.categoria && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Tag className="size-3" />
                        {colaborador.categoria.nome}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {colaborador.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3" />
                        <span className="truncate">{colaborador.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Senha:</span>
                      <PasswordReveal
                        colaboradorId={colaborador.id}
                        hasPassword={!!colaborador.senha}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Versão desktop com tabela
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                    Colaborador
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
                {colaboradores.map((colaborador) => {
                  const isActive = colaborador.ativo

                  return (
                    <tr key={colaborador.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">
                              {getInitials(colaborador.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">
                              {colaborador.nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="text-sm text-foreground">
                          {colaborador.email || "-"}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="text-sm text-foreground">
                          {colaborador.departamento || "-"}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        {colaborador.categoria ? (
                          <Badge variant="secondary" className="text-xs">
                            {colaborador.categoria.nome}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <PasswordReveal
                          colaboradorId={colaborador.id}
                          hasPassword={!!colaborador.senha}
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
                        <ColaboradoresRowActions colaborador={colaborador} onSuccess={onRefresh} />
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
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
            {pagination.total} colaboradores
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
