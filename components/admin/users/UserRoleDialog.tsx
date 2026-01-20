"use client"

import { useState } from "react"
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

interface UserRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  currentRole: "USER" | "AGENT" | "ADMIN"
  onSuccess: () => void
}

export function UserRoleDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentRole,
  onSuccess,
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<"USER" | "AGENT" | "ADMIN">(currentRole)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar cargo")
      }

      toast.success("Cargo atualizado com sucesso")
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao atualizar cargo:", error)
      toast.error(error.message || "Erro ao atualizar cargo do usuário")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mudar cargo de {userName}</DialogTitle>
          <DialogDescription>
            Selecione o novo cargo para este usuário. Esta ação pode afetar as permissões de acesso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Cargo</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as "USER" | "AGENT" | "ADMIN")}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuário</SelectItem>
                <SelectItem value="AGENT">Agente</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
