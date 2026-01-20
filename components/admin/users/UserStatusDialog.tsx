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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface UserStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  isActive: boolean
  onSuccess: () => void
}

export function UserStatusDialog({
  open,
  onOpenChange,
  userId,
  userName,
  isActive,
  onSuccess,
}: UserStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isActive }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar status")
      }

      toast.success(
        isActive
          ? "Usuário desativado com sucesso"
          : "Usuário ativado com sucesso"
      )
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error)
      toast.error(error.message || "Erro ao atualizar status do usuário")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isActive ? "Desativar" : "Ativar"} usuário
          </DialogTitle>
          <DialogDescription>
            {isActive ? (
              <>
                Tem certeza que deseja desativar <strong>{userName}</strong>?
                O usuário não poderá mais acessar o sistema até ser reativado.
              </>
            ) : (
              <>
                Tem certeza que deseja ativar <strong>{userName}</strong>?
                O usuário poderá acessar o sistema novamente.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant={isActive ? "destructive" : "default"}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isActive ? "Desativar" : "Ativar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
