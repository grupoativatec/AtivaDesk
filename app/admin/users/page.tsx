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
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
            <span className="truncate">Usuários</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie usuários, cargos e permissões do sistema
          </p>
        </div>
        <Button
          onClick={() => setTeamsDialogOpen(true)}
          variant="outline"
          className="w-full sm:w-auto shrink-0"
        >
          <Users2 className="mr-2 h-4 w-4" />
          Equipes
        </Button>
      </div>

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
  )
}
