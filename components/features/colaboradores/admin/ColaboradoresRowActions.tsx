"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import { EditColaboradorModal } from "./EditColaboradorModal"
import { toast } from "sonner"

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

interface ColaboradoresRowActionsProps {
  colaborador: ColaboradorExterno
  onSuccess: () => void
}

export function ColaboradoresRowActions({
  colaborador,
  onSuccess,
}: ColaboradoresRowActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/colaboradores/${colaborador.id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir colaborador")
      }

      toast.success("Colaborador excluído com sucesso!")
      setIsDeleteDialogOpen(false)
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao excluir colaborador:", error)
      toast.error(error.message || "Erro ao excluir colaborador")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      const newStatus = !colaborador.ativo
      const res = await fetch(`/api/admin/colaboradores/${colaborador.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ativo: newStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar status")
      }

      toast.success(
        newStatus
          ? "Colaborador ativado com sucesso!"
          : "Colaborador desativado com sucesso!"
      )
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error)
      toast.error(error.message || "Erro ao atualizar status")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {colaborador.ativo ? "Desativar" : "Ativar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditColaboradorModal
        colaborador={colaborador}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={onSuccess}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o colaborador <strong>{colaborador.nome}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
