"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { UsersToolbar } from "@/components/admin/users/UsersToolbar"
import { UsersTable } from "@/components/admin/users/UsersTable"
import { TeamsManagementDialog } from "@/components/admin/users/TeamsManagementDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Users as UsersIcon, Users2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "USER" | "AGENT" | "ADMIN"
  createdAt: string
  deletedAt: string | null
  teamMemberships?: Array<{ team: { id: string; name: string } }>
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("active")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    pageSize: number
    total: number
    totalPages: number
  } | null>(null)
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false)

  // Debounce para busca
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset para primeira página ao buscar
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim())
      }

      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      params.append("page", page.toString())
      params.append("pageSize", "10")

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar usuários")
      }

      setUsers(data.users || [])
      setPagination(data.pagination || null)
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error)
      toast.error(error.message || "Erro ao carregar usuários")
      setUsers([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [debouncedSearch, roleFilter, statusFilter, page])

  const handleRefresh = () => {
    fetchUsers()
  }

  const handleClearFilters = () => {
    setSearch("")
    setRoleFilter("all")
    setStatusFilter("active")
    setPage(1)
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (roleFilter !== "all") count++
    if (statusFilter !== "all") count++
    return count
  }, [roleFilter, statusFilter])

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-2">
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="truncate">Usuários</span>
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                Gerencie usuários, cargos e permissões do sistema
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setTeamsDialogOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Users2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Equipes</span>
                <span className="sm:hidden">Equipes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-6">

          {/* Toolbar */}
          <UsersToolbar
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onRefresh={handleRefresh}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />

          {/* Tabela */}
          <UsersTable
            users={users}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            pagination={pagination || undefined}
            onPageChange={setPage}
          />

          {/* Dialog de gerenciamento de equipes */}
          <TeamsManagementDialog
            open={teamsDialogOpen}
            onOpenChange={setTeamsDialogOpen}
            onSuccess={() => {
              handleRefresh()
            }}
          />
        </div>
      </div>
    </div>
  )
}
