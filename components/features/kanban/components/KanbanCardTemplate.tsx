"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Calendar, Save, User, AlertCircle } from "lucide-react"
import { useKanbanStore } from "../store/useKanbanStore"
import { KanbanStatus } from "../types/kanban.types"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"
import { KanbanTagsInput } from "./KanbanTagsInput"

interface KanbanCardTemplateProps {
  boardId: string
  columnId: string
  columnStatus: KanbanStatus
  onCancel: () => void
}

export function KanbanCardTemplate({
  boardId,
  columnId,
  columnStatus,
  onCancel,
}: KanbanCardTemplateProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | undefined>(undefined)
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const addCard = useKanbanStore((state) => state.addCard)

  // Mock de usuários disponíveis (será substituído por dados reais)
  const availableUsers = [
    { id: "user-1", name: "João Silva", email: "joao@example.com", avatar: undefined },
    { id: "user-2", name: "Maria Santos", email: "maria@example.com", avatar: undefined },
    { id: "user-3", name: "Pedro Costa", email: "pedro@example.com", avatar: undefined },
    { id: "user-4", name: "Ana Oliveira", email: "ana@example.com", avatar: undefined },
  ]

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  const handleSave = async () => {
    if (!title.trim()) return

    setIsLoading(true)

    try {
      const selectedUser = availableUsers.find((u) => u.id === assigneeId)

      const newCard = {
        id: `card-${nanoid()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        status: columnStatus,
        order: 0, // Decorativo
        priority,
        dueDate: dueDate || undefined,
        assigneeId,
        assigneeName: selectedUser?.name,
        assigneeAvatar: selectedUser?.avatar,
        tags: tags.length > 0 ? tags : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addCard(boardId, newCard, columnId)
      setIsLoading(false)
      onCancel()
    } catch (error) {
      // Erro já foi tratado no store (rollback automático)
      setIsLoading(false)
      // Em produção, pode mostrar uma notificação de erro aqui
      console.error("Erro ao criar card:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel()
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  const priorityColors = {
    HIGH: "border-l-red-500",
    MEDIUM: "border-l-yellow-500",
    LOW: "border-l-blue-500",
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed border-primary/40 bg-card/50 backdrop-blur-sm",
        "shadow-lg transition-all duration-200",
        priority && priorityColors[priority],
        "hover:border-primary/60 hover:shadow-xl"
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Barra lateral de prioridade */}
      {priority && (
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
            priorityColors[priority]
          )}
        />
      )}

      <div className="p-4 space-y-4">
        {/* Título */}
        <div className="space-y-1">
          <Input
            ref={titleInputRef}
            placeholder="Título do card..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            className={cn(
              "text-sm font-semibold border-none bg-transparent p-0 h-auto",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/60",
              !title.trim() && "text-muted-foreground"
            )}
          />
          {!title.trim() && (
            <div className="flex items-center gap-1 text-xs text-destructive/70">
              <AlertCircle className="h-3 w-3" />
              <span>Título é obrigatório</span>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div>
          <Textarea
            placeholder="Adicione uma descrição (opcional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className={cn(
              "min-h-[60px] resize-none border-none bg-transparent p-0",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/50 text-sm",
              "leading-relaxed"
            )}
            rows={2}
          />
        </div>

        {/* Grid de campos (responsivo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Prazo */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Prazo
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              className="h-8 text-xs border-border/50 bg-muted/30 hover:bg-muted/50 focus-visible:bg-background transition-colors"
            />
          </div>

          {/* Prioridade */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Prioridade
            </label>
            <Select
              value={priority || "none"}
              onValueChange={(value) =>
                setPriority(value === "none" ? undefined : (value as "LOW" | "MEDIUM" | "HIGH"))
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 text-xs border-border/50 bg-muted/30 hover:bg-muted/50">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem prioridade</SelectItem>
                <SelectItem value="HIGH">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Alta
                  </span>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Média
                  </span>
                </SelectItem>
                <SelectItem value="LOW">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Baixa
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responsável */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <User className="h-3 w-3" />
            Responsável
          </label>
          <Select
            value={assigneeId || "none"}
            onValueChange={(value) => setAssigneeId(value === "none" ? undefined : value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 text-xs border-border/50 bg-muted/30 hover:bg-muted/50">
              <SelectValue placeholder="Selecione um responsável..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem responsável</SelectItem>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Tags
          </label>
          <KanbanTagsInput
            tags={tags}
            onChange={setTags}
            placeholder="Digite e pressione Enter..."
            disabled={isLoading}
          />
        </div>

        {/* Divisor */}
        <div className="border-t border-border/50" />

        {/* Ações */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="h-8 text-xs hover:bg-muted/80"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Cancelar
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
              Ctrl/Cmd + Enter
            </span>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!title.trim() || isLoading}
              className="h-8 text-xs px-4 font-medium"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
