"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar, X, Save, User as UserIcon } from "lucide-react"
import { useKanbanStore } from "../store/useKanbanStore"
import { KanbanCard as KanbanCardType } from "../types/kanban.types"
import { cn } from "@/lib/utils"
import { listUsers } from "@/lib/api/users"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TaskPriorityBadge } from "@/components/features/admin/tasks/TaskPriorityBadge"

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
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined>(
    card.priority
  )
  const [assigneeId, setAssigneeId] = useState<string | undefined>(card.assigneeId)
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const updateCard = useKanbanStore((state) => state.updateCard)

  // Carregar usuários ao montar
  useEffect(() => {
    loadUsers()
  }, [])

  // Focar no input de título ao montar
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const users = await listUsers("ADMIN") // Buscar apenas admins
      setAvailableUsers(users)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Título é obrigatório")
      return
    }

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
        assigneeAvatar: undefined,
        tags: card.tags, // Manter tags existentes por enquanto
      })

      setIsLoading(false)
      onCancel()
      toast.success("Card atualizado com sucesso")
    } catch (error) {
      setIsLoading(false)
      console.error("Erro ao atualizar card:", error)
      toast.error("Erro ao atualizar card")
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

  const selectedUser = availableUsers.find((u) => u.id === assigneeId)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Renderiza como um card inline, igual ao card original
  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:border-border",
        priority && priority === "URGENT" && "border-red-500/50",
        priority && priority === "HIGH" && "border-orange-500/50",
        priority && priority === "MEDIUM" && "border-yellow-500/50",
        priority && priority === "LOW" && "border-blue-500/50"
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Barra de prioridade no topo (estilo Trello) */}
      {priority && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1 rounded-t-lg",
            priority === "URGENT" && "bg-red-500",
            priority === "HIGH" && "bg-orange-500",
            priority === "MEDIUM" && "bg-yellow-500",
            priority === "LOW" && "bg-blue-500"
          )}
        />
      )}

      {/* Conteúdo do card */}
      <div className={cn("space-y-2.5", priority && "pt-1")}>
        {/* Título */}
        <Input
          ref={titleInputRef}
          placeholder="Título do card..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className={cn(
            "h-auto p-0 border-none bg-transparent text-sm font-semibold leading-snug",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/60"
          )}
        />

        {/* Descrição */}
        <Textarea
          placeholder="Adicione uma descrição..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          className={cn(
            "min-h-[40px] resize-none border-none bg-transparent p-0 text-xs",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/50 leading-relaxed"
          )}
          rows={2}
        />

        {/* Footer com metadados inline */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Data de vencimento */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-[10px] font-medium",
                    dueDate && "text-foreground"
                  )}
                  disabled={isLoading}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {dueDate
                    ? new Date(dueDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "Prazo"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </PopoverContent>
            </Popover>

            {/* Prioridade */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  disabled={isLoading}
                >
                  {priority ? (
                    <TaskPriorityBadge priority={priority} />
                  ) : (
                    "Prioridade"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" align="start">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setPriority(undefined)}
                  >
                    Sem prioridade
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setPriority("LOW")}
                  >
                    Baixa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setPriority("MEDIUM")}
                  >
                    Média
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setPriority("HIGH")}
                  >
                    Alta
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setPriority("URGENT")}
                  >
                    Urgente
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Avatar do assignee */}
          <Popover open={isAssigneePopoverOpen} onOpenChange={setIsAssigneePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                disabled={isLoading || isLoadingUsers}
              >
                {selectedUser ? (
                  <Avatar className="h-6 w-6 border-2 border-background shadow-sm">
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1" align="end">
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setAssigneeId(undefined)
                    setIsAssigneePopoverOpen(false)
                  }}
                >
                  Sem responsável
                </Button>
                {isLoadingUsers ? (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    Carregando...
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        setAssigneeId(user.id)
                        setIsAssigneePopoverOpen(false)
                      }}
                    >
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {user.name}
                    </Button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
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
            className="h-7 text-xs px-3"
          >
            <Save className="h-3 w-3 mr-1" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
