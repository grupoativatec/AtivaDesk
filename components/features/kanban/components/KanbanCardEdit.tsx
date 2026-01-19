"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar, Save, User } from "lucide-react"
import { useKanbanStore } from "../store/useKanbanStore"
import { KanbanCard as KanbanCardType } from "../types/kanban.types"
import { cn } from "@/lib/utils"
import { KanbanTagsInput } from "./KanbanTagsInput"

interface KanbanCardEditProps {
  boardId: string
  card: KanbanCardType
  onCancel: () => void
}

export function KanbanCardEdit({ boardId, card, onCancel }: KanbanCardEditProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""
  )
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | undefined>(
    card.priority
  )
  const [assigneeId, setAssigneeId] = useState<string | undefined>(card.assigneeId)
  const [tags, setTags] = useState<string[]>(card.tags || [])
  const [isLoading, setIsLoading] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const updateCard = useKanbanStore((state) => state.updateCard)

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
      titleInputRef.current.select()
    }
  }, [])

  const handleSave = async () => {
    if (!title.trim()) return

    setIsLoading(true)

    try {
      const selectedUser = availableUsers.find((u) => u.id === assigneeId)

      await updateCard(boardId, card.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        assigneeId,
        assigneeName: selectedUser?.name,
        assigneeAvatar: selectedUser?.avatar,
        tags: tags.length > 0 ? tags : undefined,
      })

      setIsLoading(false)
      onCancel()
    } catch (error) {
      // Erro já foi tratado no store (rollback automático)
      setIsLoading(false)
      // Em produção, pode mostrar uma notificação de erro aqui
      console.error("Erro ao atualizar card:", error)
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
    HIGH: "border-red-500/50 bg-red-500/5",
    MEDIUM: "border-yellow-500/50 bg-yellow-500/5",
    LOW: "border-blue-500/50 bg-blue-500/5",
  }

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-primary/50 bg-background p-3 shadow-sm transition-all",
        priority && priorityColors[priority]
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Header com título editável */}
      <Input
        ref={titleInputRef}
        placeholder="Título do card..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
        className="mb-2 font-semibold border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-sm"
      />

      {/* Descrição editável */}
      <Textarea
        placeholder="Adicione uma descrição..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
        className="mb-2 min-h-[60px] resize-none border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-xs"
        rows={2}
      />

      {/* Campos adicionais */}
      <div className="space-y-2 mb-2">
        {/* Prazo */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
            className="h-7 text-xs border bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>

        {/* Prioridade */}
        <div className="flex items-center gap-2">
          <select
            value={priority || ""}
            onChange={(e) =>
              setPriority(
                e.target.value === "" ? undefined : (e.target.value as "LOW" | "MEDIUM" | "HIGH")
              )
            }
            disabled={isLoading}
            className="text-xs bg-muted/50 border rounded px-2 py-1 outline-none cursor-pointer text-muted-foreground hover:text-foreground focus:ring-1 focus:ring-primary/20"
          >
            <option value="">Sem prioridade</option>
            <option value="HIGH">🔴 Alta</option>
            <option value="MEDIUM">🟡 Média</option>
            <option value="LOW">🔵 Baixa</option>
          </select>
        </div>

        {/* Responsável */}
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground shrink-0" />
          <select
            value={assigneeId || ""}
            onChange={(e) => setAssigneeId(e.target.value === "" ? undefined : e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs bg-muted/50 border rounded px-2 py-1 outline-none cursor-pointer text-muted-foreground hover:text-foreground focus:ring-1 focus:ring-primary/20"
          >
            <option value="">Sem responsável</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="flex items-start gap-2">
          <KanbanTagsInput
            tags={tags}
            onChange={setTags}
            placeholder="Adicionar tags..."
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          className="h-7 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!title.trim() || isLoading}
          className="h-7 text-xs"
        >
          <Save className="h-3 w-3 mr-1" />
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Dica de atalho */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Ctrl/Cmd + Enter para salvar • Esc para cancelar
      </p>
    </div>
  )
}
