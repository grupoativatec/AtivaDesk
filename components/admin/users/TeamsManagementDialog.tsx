"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Edit2, X, Users, UserPlus, FolderKanban, ListTodo, Building2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Team {
  id: string
  name: string
  description: string | null
  members: Array<{
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }>
  _count: {
    projects: number
    tasks: number
  }
}

interface TeamsManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TeamsManagementDialog({
  open,
  onOpenChange,
  onSuccess,
}: TeamsManagementDialogProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Estados para criar/editar equipe
  const [isCreating, setIsCreating] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null)

  // Estados para adicionar membro
  const [addingMemberToTeam, setAddingMemberToTeam] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")

  // Formulário
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      fetchTeams()
    }
  }, [open])

  const fetchTeams = async () => {
    try {
      setIsLoadingTeams(true)
      const res = await fetch("/api/admin/teams")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar equipes")
      }

      setTeams(data.teams || [])
    } catch (error: any) {
      console.error("Erro ao buscar equipes:", error)
      toast.error(error.message || "Erro ao carregar equipes")
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const fetchAvailableUsers = async (teamId: string) => {
    try {
      const res = await fetch("/api/admin/users?role=ADMIN&status=active&all=true")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar usuários")
      }

      // Filtrar usuários que já são membros da equipe
      const team = teams.find((t) => t.id === teamId)
      const memberIds = team?.members.map((m) => m.user.id) || []
      const available = data.users.filter(
        (u: any) => !memberIds.includes(u.id)
      )

      setAvailableUsers(available)
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error)
      toast.error(error.message || "Erro ao carregar usuários")
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Nome da equipe é obrigatório")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          description: teamDescription.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar equipe")
      }

      toast.success("Equipe criada com sucesso")
      setIsCreating(false)
      setTeamName("")
      setTeamDescription("")
      fetchTeams()
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao criar equipe:", error)
      toast.error(error.message || "Erro ao criar equipe")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTeam = async () => {
    if (!editingTeam || !teamName.trim()) {
      toast.error("Nome da equipe é obrigatório")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          description: teamDescription.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar equipe")
      }

      toast.success("Equipe atualizada com sucesso")
      setEditingTeam(null)
      setTeamName("")
      setTeamDescription("")
      fetchTeams()
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao atualizar equipe:", error)
      toast.error(error.message || "Erro ao atualizar equipe")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!deleteTeamId) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/teams/${deleteTeamId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao remover equipe")
      }

      toast.success("Equipe removida com sucesso")
      setDeleteTeamId(null)
      fetchTeams()
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao remover equipe:", error)
      toast.error(error.message || "Erro ao remover equipe")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!addingMemberToTeam || !selectedUserId) {
      toast.error("Selecione um usuário")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/teams/${addingMemberToTeam}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao adicionar membro")
      }

      toast.success("Membro adicionado com sucesso")
      setAddingMemberToTeam(null)
      setSelectedUserId("")
      fetchTeams()
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao adicionar membro:", error)
      toast.error(error.message || "Erro ao adicionar membro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/members?userId=${userId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao remover membro")
      }

      toast.success("Membro removido com sucesso")
      fetchTeams()
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao remover membro:", error)
      toast.error(error.message || "Erro ao remover membro")
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (team: Team) => {
    setEditingTeam(team)
    setTeamName(team.name)
    setTeamDescription(team.description || "")
    setIsCreating(false)
  }

  const startAddingMember = async (teamId: string) => {
    setAddingMemberToTeam(teamId)
    await fetchAvailableUsers(teamId)
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingTeam(null)
    setTeamName("")
    setTeamDescription("")
    setAddingMemberToTeam(null)
    setSelectedUserId("")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 w-[95vw] sm:w-full">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              Gerenciar Equipes
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm sm:text-base">
              Crie e gerencie equipes. Apenas usuários com cargo de Administrador podem ser membros.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 pt-4">
            {/* Botão criar nova equipe */}
            {!isCreating && !editingTeam && (
              <Button
                onClick={() => {
                  setIsCreating(true)
                  setEditingTeam(null)
                  setTeamName("")
                  setTeamDescription("")
                }}
                className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium shadow-sm hover:shadow-md transition-shadow"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Criar Nova Equipe
              </Button>
            )}

            {/* Formulário criar/editar */}
            {(isCreating || editingTeam) && (
              <Card className="border-2 shadow-lg min-w-0 max-w-full overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl min-w-0">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <span className="truncate">{isCreating ? "Criar Nova Equipe" : "Editar Equipe"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5 px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 min-w-0">
                  <div className="space-y-2">
                    <Label htmlFor="team-name" className="text-sm font-semibold">
                      Nome da Equipe *
                    </Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Ex: Equipe Frontend, Equipe Backend..."
                      disabled={isLoading}
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-description" className="text-sm font-semibold">
                      Descrição
                    </Label>
                    <Textarea
                      id="team-description"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder="Descreva o propósito ou responsabilidades desta equipe..."
                      disabled={isLoading}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <Button
                      onClick={isCreating ? handleCreateTeam : handleUpdateTeam}
                      disabled={isLoading || !teamName.trim()}
                      className="flex-1 h-10 w-full sm:w-auto"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isCreating ? "Criar Equipe" : "Salvar Alterações"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelForm}
                      disabled={isLoading}
                      className="h-10 w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de equipes */}
            {!isCreating && !editingTeam && (
              <div className="space-y-4">
                {isLoadingTeams ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Carregando equipes...</p>
                  </div>
                ) : teams.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="p-4 rounded-full bg-muted mb-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Nenhuma equipe criada</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                        Comece criando sua primeira equipe para organizar melhor os administradores do sistema.
                      </p>
                      <Button
                        onClick={() => {
                          setIsCreating(true)
                          setEditingTeam(null)
                          setTeamName("")
                          setTeamDescription("")
                        }}
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeira Equipe
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {teams.map((team) => (
                      <Card key={team.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50 flex flex-col min-w-0 max-w-full overflow-hidden">
                        <CardHeader className="pb-3 px-3 sm:px-4 md:px-6">
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <CardTitle className="text-base sm:text-lg font-semibold truncate min-w-0">
                                  {team.name}
                                </CardTitle>
                              </div>
                              {team.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {team.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                                  <Users className="h-3.5 w-3.5 shrink-0" />
                                  <span className="font-medium">{team.members.length}</span>
                                  <span className="whitespace-nowrap">membro{team.members.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                                  <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                                  <span className="font-medium">{team._count.projects}</span>
                                  <span className="whitespace-nowrap">projeto{team._count.projects !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                                  <ListTodo className="h-3.5 w-3.5 shrink-0" />
                                  <span className="font-medium">{team._count.tasks}</span>
                                  <span className="whitespace-nowrap">tarefa{team._count.tasks !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(team)}
                                className="h-8 w-8 p-0 shrink-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTeamId(team.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 flex-1 min-w-0">
                          {/* Membros */}
                          <div className="space-y-3 min-w-0">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">Membros</span>
                              </Label>
                              {addingMemberToTeam !== team.id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startAddingMember(team.id)}
                                  className="h-7 sm:h-8 text-xs shrink-0 whitespace-nowrap"
                                >
                                  <Plus className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                                  <span className="hidden sm:inline">Adicionar</span>
                                  <span className="sm:hidden">+</span>
                                </Button>
                              )}
                            </div>

                            {addingMemberToTeam === team.id && (
                              <div className="p-2 sm:p-3 border-2 border-dashed rounded-lg bg-muted/30 space-y-2 min-w-0">
                                <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                                  {mounted ? (
                                    <Select
                                      value={selectedUserId}
                                      onValueChange={setSelectedUserId}
                                      disabled={isLoading}
                                    >
                                      <SelectTrigger className="flex-1 h-9 w-full sm:w-auto min-w-0">
                                        <SelectValue placeholder="Selecione um usuário ADMIN" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableUsers.length === 0 ? (
                                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                            Nenhum usuário disponível
                                          </div>
                                        ) : (
                                          availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                              <div className="flex flex-col min-w-0">
                                                <span className="font-medium text-sm truncate">{user.name}</span>
                                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                              </div>
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="h-9 flex-1 rounded-md border bg-background px-3 py-2 text-sm flex items-center text-muted-foreground min-w-0">
                                      Carregando...
                                    </div>
                                  )}
                                  <div className="flex gap-2 shrink-0">
                                    <Button
                                      onClick={handleAddMember}
                                      disabled={isLoading || !selectedUserId}
                                      size="sm"
                                      className="h-9 flex-1 sm:flex-initial whitespace-nowrap"
                                    >
                                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
                                      <span className="hidden sm:inline">Adicionar</span>
                                      <span className="sm:hidden">+</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setAddingMemberToTeam(null)
                                        setSelectedUserId("")
                                      }}
                                      disabled={isLoading}
                                      className="h-9 w-9 p-0 shrink-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {team.members.length === 0 ? (
                              <div className="py-6 text-center border border-dashed rounded-lg bg-muted/20">
                                <UserPlus className="h-5 w-5 mx-auto mb-2 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">
                                  Nenhum membro nesta equipe
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {team.members.map(({ user }) => (
                                  <Badge
                                    key={user.id}
                                    variant="secondary"
                                    className="gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors group"
                                  >
                                    <span>{user.name}</span>
                                    <button
                                      onClick={() => handleRemoveMember(team.id, user.id)}
                                      disabled={isLoading}
                                      className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Remover membro"
                                    >
                                      <X className="h-3 w-3 text-destructive" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t px-0 sm:px-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 w-full sm:w-auto"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para deletar */}
      <AlertDialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta equipe? Esta ação não pode ser desfeita.
              Os projetos e tarefas atribuídos a esta equipe não serão removidos, apenas a atribuição será desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
