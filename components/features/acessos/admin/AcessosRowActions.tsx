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
import { EditAcessoModal } from "./EditAcessoModal"
import { toast } from "sonner"

interface AcessoExterno {
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

interface AcessosRowActionsProps {
  acesso: AcessoExterno
  onSuccess: () => void
}

export function AcessosRowActions({
  acesso,
  onSuccess,
}: AcessosRowActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/acessos/${acesso.id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir acesso")
      }

      toast.success("Acesso excluído com sucesso!")
      setIsDeleteDialogOpen(false)
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao excluir acesso:", error)
      toast.error(error.message || "Erro ao excluir acesso")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      const newStatus = !acesso.ativo
      const res = await fetch(`/api/admin/acessos/${acesso.id}`, {
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
          ? "Acesso ativado com sucesso!"
          : "Acesso desativado com sucesso!"
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
            {acesso.ativo ? "Desativar" : "Ativar"}
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

      <EditAcessoModal
        acesso={acesso}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={onSuccess}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o acesso <strong>{acesso.nome}</strong>?
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
