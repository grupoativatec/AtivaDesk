"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { RichTextEditor } from "@/components/features/tickets/shared/rich-text-editor"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type TicketCategory = "HARDWARE" | "SOFTWARE" | "NETWORK" | "EMAIL" | "ACCESS" | "OTHER"
type TicketUnit = "ITJ" | "SFS" | "FOZ" | "DIO" | "AOL"

const CATEGORIES = [
  { value: "HARDWARE", label: "Hardware" },
  { value: "SOFTWARE", label: "Software" },
  { value: "NETWORK", label: "Rede" },
  { value: "EMAIL", label: "E-mail" },
  { value: "ACCESS", label: "Acesso" },
  { value: "OTHER", label: "Outro" },
] as const

const UNITS = [
  { value: "ITJ", label: "ITJ" },
  { value: "SFS", label: "SFS" },
  { value: "FOZ", label: "FOZ" },
  { value: "DIO", label: "DIO" },
  { value: "AOL", label: "AOL" },
] as const

interface NewTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NewTicketModal({ open, onOpenChange, onSuccess }: NewTicketModalProps) {
  const router = useRouter()
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<TicketCategory>("OTHER")
  const [unit, setUnit] = useState<TicketUnit | "">("")
  const [description, setDescription] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string
    category?: string
    unit?: string
    description?: string
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!title.trim()) {
      newErrors.title = "Título é obrigatório"
    } else if (title.trim().length < 5) {
      newErrors.title = "Título deve ter pelo menos 5 caracteres"
    }

    if (!category) {
      newErrors.category = "Categoria é obrigatória"
    }

    if (!unit) {
      newErrors.unit = "Unidade é obrigatória"
    }

    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Descrição deve ter pelo menos 10 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateTicket = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor, preencha todos os campos obrigatórios corretamente")
      return
    }

    setFormLoading(true)

    try {
      // Extrair anexos do HTML da descrição (imagens e links para arquivos)
      const uploadedAttachments: string[] = []
      const parser = new DOMParser()
      const doc = parser.parseFromString(description, "text/html")

      // Buscar todas as imagens
      const images = doc.querySelectorAll("img")
      images.forEach((img) => {
        const src = img.getAttribute("src")
        if (src && !src.startsWith("data:")) {
          uploadedAttachments.push(src)
        }
      })

      // Buscar links para arquivos (arquivos anexados)
      const fileLinks = doc.querySelectorAll("a[data-file-url]")
      fileLinks.forEach((link) => {
        const fileUrl = link.getAttribute("data-file-url")
        if (fileUrl) {
          uploadedAttachments.push(fileUrl)
        }
      })

      // Criar ticket
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          priority: "MEDIUM", // Valor padrão, admins podem alterar depois
          unit: unit as TicketUnit,
          description,
          attachments: uploadedAttachments,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar ticket")
      }

      // Verificar se o ticket foi criado e tem ID
      const ticketId = data.ticket?.id || data.id

      if (!ticketId) {
        console.error("Ticket criado mas sem ID na resposta:", data)
        toast.error("Chamado criado, mas não foi possível redirecionar")
        onOpenChange(false)
        resetForm()
        if (onSuccess) {
          onSuccess()
        }
        return
      }

      toast.success("Chamado criado com sucesso!")

      // Fechar modal e resetar formulário
      onOpenChange(false)
      resetForm()

      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess()
      }

      // Redirecionar para a página do ticket criado
      router.push(`/tickets/${ticketId}`)
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar chamado. Tente novamente.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setCategory("OTHER")
    setUnit("")
    setDescription("")
    setErrors({})
  }

  const handleClose = () => {
    if (!formLoading) {
      onOpenChange(false)
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Novo Chamado</DialogTitle>
          <DialogDescription>
            Descreva seu problema em detalhes para que possamos ajudá-lo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTicket} className="space-y-6 mt-4">
          {/* Título */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold">
              Título / Assunto do chamado <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: undefined }))
                }
              }}
              placeholder="Ex: Problema ao acessar o sistema"
              aria-invalid={!!errors.title}
              className={cn(
                "h-11 text-base",
                errors.title && "border-destructive ring-destructive/20"
              )}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Categoria e Unidade em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unidade */}
            <div className="space-y-2">
              <label htmlFor="unit" className="text-sm font-semibold">
                Unidade <span className="text-destructive">*</span>
              </label>
              <Select
                value={unit}
                onValueChange={(value) => {
                  setUnit(value as TicketUnit)
                  if (errors.unit) {
                    setErrors((prev) => ({ ...prev, unit: undefined }))
                  }
                }}
              >
                <SelectTrigger
                  id="unit"
                  className={cn("h-11", errors.unit && "border-destructive")}
                >
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit}</p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold">
                Categoria <span className="text-destructive">*</span>
              </label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value as TicketCategory)
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: undefined }))
                  }
                }}
              >
                <SelectTrigger
                  id="category"
                  className={cn("h-11", errors.category && "border-destructive")}
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Descrição do problema <span className="text-destructive">*</span>
            </label>
            <RichTextEditor
              content={description}
              onChange={(content) => {
                setDescription(content)
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }))
                }
              }}
              error={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use o editor para formatar o texto, adicionar links, imagens e anexar arquivos diretamente
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-initial sm:min-w-[120px]"
              disabled={formLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="flex-1 sm:flex-initial sm:min-w-[180px]"
              size="default"
            >
              {formLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar chamado
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
