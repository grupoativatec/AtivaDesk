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
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
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

interface Categoria {
  id: string
  nome: string
  createdAt: string
  updatedAt: string
}

interface CategoriasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriasDialog({ open, onOpenChange }: CategoriasDialogProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [nomeCategoria, setNomeCategoria] = useState("")

  const fetchCategorias = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/acessos/categorias")
      const data = await res.json()
      if (data.ok) {
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
      toast.error("Erro ao carregar categorias")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCategorias()
    }
  }, [open])

  const handleCreate = async () => {
    if (!nomeCategoria.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch("/api/admin/acessos/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeCategoria.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar categoria")
      }

      toast.success("Categoria criada com sucesso!")
      setNomeCategoria("")
      fetchCategorias()
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar categoria")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!isDeleting) return

    try {
      const res = await fetch(`/api/admin/acessos/categorias/${isDeleting}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir categoria")
      }

      toast.success("Categoria excluída com sucesso!")
      setDeleteDialogOpen(false)
      setIsDeleting(null)
      fetchCategorias()
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir categoria")
    }
  }


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-1.5 sm:space-y-2">
            <DialogTitle className="text-lg sm:text-xl">Gerenciar Categorias</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Crie e gerencie categorias para acessos externos (ex: Itajaí, São Francisco, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Formulário de criação */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h3 className="text-sm font-semibold">Nova Categoria</h3>
              <div className="flex gap-2">
                <Input
                  value={nomeCategoria}
                  onChange={(e) => setNomeCategoria(e.target.value)}
                  placeholder="Ex: Itajaí, São Francisco..."
                  className="h-9 sm:h-10 text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nomeCategoria.trim()) {
                      handleCreate()
                    }
                  }}
                />
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !nomeCategoria.trim()}
                  size="sm"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                >
                  {isCreating && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Criar
                </Button>
              </div>
            </div>

            {/* Lista de categorias */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Categorias Existentes</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : categorias.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhuma categoria cadastrada
                </div>
              ) : (
                <div className="space-y-2">
                  {categorias.map((categoria) => (
                    <div
                      key={categoria.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{categoria.nome}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsDeleting(categoria.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline" size="sm">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
