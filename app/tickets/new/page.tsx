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
import { RichTextEditor } from "@/components/features/tickets/shared/rich-text-editor"
import { toast } from "sonner"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PRIORITIES = [
  { value: "LOW", label: "Baixa", color: "text-blue-600 dark:text-blue-400" },
  { value: "MEDIUM", label: "Média", color: "text-yellow-600 dark:text-yellow-400" },
  { value: "HIGH", label: "Alta", color: "text-orange-600 dark:text-orange-400" },
  { value: "URGENT", label: "Urgente", color: "text-red-600 dark:text-red-400" },
] as const

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

export default function NewTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<TicketCategory>("OTHER")
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM")
  const [unit, setUnit] = useState<TicketUnit | "">("")
  const [description, setDescription] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string
    category?: string
    priority?: string
    unit?: string
    description?: string
  }>({})

  type TicketCategory = "HARDWARE" | "SOFTWARE" | "NETWORK" | "EMAIL" | "ACCESS" | "OTHER"
  type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  type TicketUnit = "ITJ" | "SFS" | "FOZ" | "DIO" | "AOL"

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!title.trim()) {
      newErrors.title = "Título é obrigatório"
    } else if (title.trim().length < 5) {
      newErrors.title = "Título deve ter pelo menos 5 caracteres"
    }

    if (!category) {
      newErrors.category = "Categoria é obrigatória"
    }

    if (!priority) {
      newErrors.priority = "Prioridade é obrigatória"
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Por favor, preencha todos os campos obrigatórios corretamente")
      return
    }

    setLoading(true)

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
          priority,
          unit: unit as TicketUnit,
          description,
          attachments: uploadedAttachments,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar ticket")
      }

      toast.success("Chamado criado com sucesso!", {
        description: "Seu chamado foi registrado e será analisado em breve.",
      })

      // Redirecionar após 1.5 segundos
      setTimeout(() => {
        router.push("/tickets")
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar chamado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tickets")}
            className="mb-3 sm:mb-4 md:mb-6 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <ArrowLeft className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
              Novo Chamado
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Descreva seu problema em detalhes para que possamos ajudá-lo
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card dark:bg-card/50 border border-border dark:border-border/50 rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Título */}
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="title" className="text-xs sm:text-sm font-semibold">
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
                    "h-10 sm:h-11 md:h-12 text-sm sm:text-base",
                    errors.title && "border-destructive ring-destructive/20"
                  )}
                />
                {errors.title && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Categoria, Prioridade e Unidade em Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {/* Unidade */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="unit" className="text-xs sm:text-sm font-semibold">
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
                      error={!!errors.unit}
                      id="unit"
                      className="h-10 sm:h-11 md:h-12 text-sm sm:text-base"
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
                      error={!!errors.category}
                      id="category"
                      className="h-12"
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

                {/* Prioridade */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="priority" className="text-xs sm:text-sm font-semibold">
                    Prioridade <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={priority}
                    onValueChange={(value) => {
                      setPriority(value as TicketPriority)
                      if (errors.priority) {
                        setErrors((prev) => ({ ...prev, priority: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger
                      error={!!errors.priority}
                      id="priority"
                      className="h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                    >
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((pri) => (
                        <SelectItem key={pri.value} value={pri.value}>
                          {pri.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-destructive">{errors.priority}</p>
                  )}
                </div>


              </div>

              {/* Descrição */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-semibold">
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
                  <p className="text-xs sm:text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Use o editor para formatar o texto, adicionar links, imagens e anexar arquivos diretamente
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-5 md:pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/tickets")}
                  className="flex-1 sm:flex-initial sm:min-w-[120px] h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-initial sm:min-w-[180px] h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
                      Enviar chamado
                    </>
                  )}
                </Button>
              </div>
            </form>
        </div>
      </div>
    </div>
  )
}
