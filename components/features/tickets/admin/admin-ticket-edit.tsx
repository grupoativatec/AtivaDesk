"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Loader2, Settings2, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
}

type TicketEditProps = {
  ticket: {
    id: string
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    category: string
    unit: string | null
    assignee: {
      id: string
      name: string
      email: string
    } | null
    team: {
      id: string
      name: string
    } | null
  }
  onUpdate: () => void
}

export function AdminTicketEdit({ ticket, onUpdate }: TicketEditProps) {
  const [status, setStatus] = useState<string>(ticket.status)
  const [priority, setPriority] = useState<string>(ticket.priority)
  const [category, setCategory] = useState<string>(ticket.category)
  const [unit, setUnit] = useState<string>(ticket.unit || "none")
  const [assigneeId, setAssigneeId] = useState<string>(ticket.assignee?.id || "none")
  const [teamId, setTeamId] = useState<string>(ticket.team?.id || "none")
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  // Atualizar estados quando o ticket mudar
  useEffect(() => {
    setStatus(ticket.status)
    setPriority(ticket.priority)
    setCategory(ticket.category)
    setUnit(ticket.unit || "none")
    setAssigneeId(ticket.assignee?.id || "none")
    setTeamId(ticket.team?.id || "none")
  }, [ticket])

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true)
      const res = await fetch("/api/admin/users?role=ADMIN&status=active&all=true")
      const data = await res.json()

      if (res.ok && data.users) {
        setAdmins(data.users)
      }
    } catch (error) {
      console.error("Erro ao buscar admins:", error)
      toast.error("Erro ao carregar lista de administradores")
    } finally {
      setLoadingAdmins(false)
    }
  }

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true)
      const res = await fetch("/api/admin/teams")
      const data = await res.json()

      if (res.ok && data.teams) {
        setTeams(data.teams.map((t: any) => ({ id: t.id, name: t.name })))
      }
    } catch (error) {
      console.error("Erro ao buscar equipes:", error)
      toast.error("Erro ao carregar lista de equipes")
    } finally {
      setLoadingTeams(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const updateData: any = {}
      let hasChanges = false

      if (status !== ticket.status) {
        updateData.status = status
        hasChanges = true
      }

      if (priority !== ticket.priority) {
        updateData.priority = priority
        hasChanges = true
      }

      if (category !== ticket.category) {
        updateData.category = category
        hasChanges = true
      }

      if (unit !== (ticket.unit || "none")) {
        updateData.unit = unit === "none" ? null : unit
        hasChanges = true
      }

      if (assigneeId !== (ticket.assignee?.id || "none")) {
        updateData.assigneeId = assigneeId === "none" ? null : assigneeId
        hasChanges = true
      }

      if (teamId !== (ticket.team?.id || "none")) {
        updateData.teamId = teamId === "none" ? null : teamId
        hasChanges = true
      }

      if (!hasChanges) {
        toast.info("Nenhuma alteração foi feita")
        return
      }

      const res = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar ticket")
      }

      toast.success("Ticket atualizado com sucesso!")
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-2xl bg-card/60 backdrop-blur-sm shadow-lg overflow-hidden">
      {/* Header - Sempre visível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 sm:p-8 lg:p-10 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Editar Ticket</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>

      {/* Conteúdo - Colapsável */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
              <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Status */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Aberto</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
              <SelectItem value="RESOLVED">Resolvido</SelectItem>
              <SelectItem value="CLOSED">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prioridade */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Prioridade</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Baixa</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Categoria</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HARDWARE">Hardware</SelectItem>
              <SelectItem value="SOFTWARE">Software</SelectItem>
              <SelectItem value="NETWORK">Rede</SelectItem>
              <SelectItem value="EMAIL">E-mail</SelectItem>
              <SelectItem value="ACCESS">Acesso</SelectItem>
              <SelectItem value="OTHER">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Unidade */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Unidade</label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="ITJ">ITJ</SelectItem>
              <SelectItem value="SFS">SFS</SelectItem>
              <SelectItem value="FOZ">FOZ</SelectItem>
              <SelectItem value="DIO">DIO</SelectItem>
              <SelectItem value="AOL">AOL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Atribuir Equipe */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Atribuir Equipe</label>
          {mounted ? (
            loadingTeams ? (
              <div className="h-11 flex items-center justify-center border rounded-md">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma equipe</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          ) : (
            <div className="h-11 rounded-md border bg-background px-3 py-2 text-sm flex items-center text-muted-foreground">
              Carregando...
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Todos os membros da equipe receberão notificação.
          </p>
        </div>

        {/* Atribuir a (Admin Individual) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Atribuir a (Admin Individual)</label>
          {loadingAdmins ? (
            <div className="h-11 flex items-center justify-center border rounded-md">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não atribuído</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">
            Você pode atribuir um admin individual além da equipe.
          </p>
        </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t px-6 sm:px-8 lg:px-10">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
