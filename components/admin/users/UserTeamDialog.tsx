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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Team {
  id: string
  name: string
}

interface UserTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userRole: "USER" | "AGENT" | "ADMIN"
  currentTeams: Array<{ team: { id: string; name: string } }>
  onSuccess: () => void
}

export function UserTeamDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userRole,
  currentTeams,
  onSuccess,
}: UserTeamDialogProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar equipes disponíveis
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

  const handleAddTeam = async () => {
    if (!selectedTeamId) {
      toast.error("Selecione uma equipe")
      return
    }

    // Verificar se já é membro
    if (currentTeams.some((t) => t.team.id === selectedTeamId)) {
      toast.error("Usuário já é membro desta equipe")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/teams/${selectedTeamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao adicionar membro")
      }

      toast.success("Usuário adicionado à equipe com sucesso")
      onSuccess()
      setSelectedTeamId("")
    } catch (error: any) {
      console.error("Erro ao adicionar membro:", error)
      toast.error(error.message || "Erro ao adicionar usuário à equipe")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveTeam = async (teamId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/members?userId=${userId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao remover membro")
      }

      toast.success("Usuário removido da equipe com sucesso")
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao remover membro:", error)
      toast.error(error.message || "Erro ao remover usuário da equipe")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar equipes já atribuídas
  const availableTeams = teams.filter(
    (team) => !currentTeams.some((t) => t.team.id === team.id)
  )

  // Se não é ADMIN, não pode ser atribuído a equipes
  if (userRole !== "ADMIN") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir a equipe</DialogTitle>
            <DialogDescription>
              Apenas usuários com cargo de Administrador podem ser atribuídos a equipes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Equipes de {userName}</DialogTitle>
          <DialogDescription>
            Gerencie as equipes às quais este usuário pertence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Equipes atuais */}
          {currentTeams.length > 0 && (
            <div className="space-y-2">
              <Label>Equipes atuais</Label>
              <div className="flex flex-wrap gap-2">
                {currentTeams.map(({ team }) => (
                  <Badge key={team.id} variant="secondary" className="gap-1">
                    {team.name}
                    <button
                      onClick={() => handleRemoveTeam(team.id)}
                      disabled={isLoading}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar nova equipe */}
          <div className="space-y-2">
            <Label htmlFor="team">Adicionar equipe</Label>
            {isLoadingTeams ? (
              <div className="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm flex items-center">
                Carregando equipes...
              </div>
            ) : mounted ? (
              <Select
                value={selectedTeamId}
                onValueChange={setSelectedTeamId}
                disabled={isLoading || availableTeams.length === 0}
              >
                <SelectTrigger id="team">
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Nenhuma equipe disponível
                    </div>
                  ) : (
                    availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm flex items-center text-muted-foreground">
                Selecione uma equipe
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Fechar
          </Button>
          <Button
            onClick={handleAddTeam}
            disabled={isLoading || !selectedTeamId || isLoadingTeams}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
