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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save, Loader2, Settings2 } from "lucide-react"
import { toast } from "sonner"

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
}

type TicketEditModalProps = {
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
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function AdminTicketEditModal({ ticket, open, onOpenChange, onUpdate }: TicketEditModalProps) {
  const [status, setStatus] = useState<string>(ticket.status)
  const [priority, setPriority] = useState<string>(ticket.priority)
  const [category, setCategory] = useState<string>(ticket.category)
  const [unit, setUnit] = useState<string>(ticket.unit || "none")
  const [assigneeId, setAssigneeId] = useState<string>(ticket.assignee?.id || "none")
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAdmins, setLoadingAdmins] = useState(true)

  useEffect(() => {
    if (open) {
      fetchAdmins()
    }
  }, [open])

  // Atualizar estados quando o ticket mudar
  useEffect(() => {
    setStatus(ticket.status)
    setPriority(ticket.priority)
    setCategory(ticket.category)
    setUnit(ticket.unit || "none")
    setAssigneeId(ticket.assignee?.id || "none")
  }, [ticket])

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true)
      const res = await fetch("/api/admin/users")
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

      // Verificar se a resposta é JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Resposta não é JSON:", text.substring(0, 200))
        throw new Error("Resposta inválida do servidor")
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar ticket")
      }

      toast.success("Ticket atualizado com sucesso!")
      onUpdate()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-5 text-primary" />
            Editar Ticket
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do ticket
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

          {/* Atribuir a */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Atribuir a</label>
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
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
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
      </DialogContent>
    </Dialog>
  )
}
