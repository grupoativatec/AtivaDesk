"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api/client"
import { listProjects } from "@/lib/api/projects"
import type { ProjectListItem } from "@/components/features/projects/admin/project.types"
import { toast } from "sonner"

interface CreateBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateBoardDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBoardDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState<string>("")
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true)
        const response = await listProjects({ status: "ACTIVE" })
        setProjects(response.projects)
      } catch (err) {
        console.error("Erro ao carregar projetos:", err)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    loadProjects()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    try {
      setIsLoading(true)

      const response = await api.post<{ ok: boolean; board: { id: string } }>(
        "/api/kanban/boards",
        {
          name: name.trim(),
          description: description.trim() || undefined,
          projectId: projectId && projectId !== "none" ? projectId : undefined,
        }
      )

      if (response.ok && response.board) {
        toast.success("Board criado com sucesso")
        // Reset form
        setName("")
        setDescription("")
        setProjectId("")
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
        // Navega para o board criado
        router.push(`/admin/kanban/${response.board.id}`)
      } else {
        toast.error("Erro ao criar board")
      }
    } catch (err: any) {
      console.error("Erro ao criar board:", err)
      toast.error(err.message || "Erro ao criar board")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setProjectId("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Board</DialogTitle>
          <DialogDescription>
            Crie um novo board Kanban para organizar suas tarefas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Board *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sprint 1 - Desenvolvimento"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste board..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Vincular a Projeto (Opcional)</Label>
            <Select
              value={projectId || "none"}
              onValueChange={(value) => setProjectId(value === "none" ? "" : value)}
              disabled={isLoading || isLoadingProjects}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Selecione um projeto para importar tarefas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum projeto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} {project.code && `(${project.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectId && projectId !== "none" && (
              <p className="text-sm text-muted-foreground">
                As tarefas do projeto serão importadas automaticamente para o board
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
