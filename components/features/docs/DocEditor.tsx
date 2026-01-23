"use client"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DocEditorProps {
  title: string
  summary: string
  content: string
  onTitleChange: (title: string) => void
  onSummaryChange: (summary: string) => void
  onContentChange: (content: string) => void
}

export function DocEditor({
  title,
  summary,
  content,
  onTitleChange,
  onSummaryChange,
  onContentChange,
}: DocEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleImageUpload = async (file: File) => {
    // Formatos de imagem aceitos
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/svg+xml",
    ]
    
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]
    
    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas imagens (PNG, JPG, GIF, WEBP, BMP, SVG)")
      return
    }
    
    // Validar tipo MIME específico
    if (!allowedTypes.includes(file.type)) {
      const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      if (!allowedExtensions.includes(extension)) {
        toast.error(`Formato não suportado. Use: PNG, JPG, GIF, WEBP, BMP ou SVG`)
        return
      }
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Imagem muito grande. Máximo: 10MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer upload da imagem")
      }

      if (!data.url) {
        throw new Error("URL não retornada pelo servidor")
      }

      // Inserir imagem no Markdown na posição do cursor
      const imageMarkdown = `![${file.name}](${data.url})`
      insertTextAtCursor(imageMarkdown)
      
      toast.success("Imagem adicionada com sucesso!")
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error)
      toast.error(error.message || "Erro ao fazer upload da imagem")
    } finally {
      setIsUploading(false)
    }
  }

  const insertTextAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.substring(0, start)
    const after = content.substring(end)
    
    // Adicionar quebra de linha antes se necessário
    const prefix = start > 0 && before[before.length - 1] !== "\n" ? "\n\n" : "\n"
    const newContent = before + prefix + text + "\n" + after
    
    onContentChange(newContent)

    // Restaurar foco e posição do cursor
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + prefix.length + text.length + 1
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file)
    } else if (file) {
      toast.error("Por favor, arraste apenas imagens")
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    
    if (!items) return

    // Procurar por imagem no clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // Verificar se é uma imagem
      if (item.type.startsWith("image/")) {
        e.preventDefault() // Prevenir colar texto padrão
        
        const file = item.getAsFile()
        if (file) {
          // Criar um nome de arquivo baseado no timestamp se não tiver nome
          if (!file.name) {
            const extension = file.type.split("/")[1] || "png"
            const timestamp = Date.now()
            Object.defineProperty(file, "name", {
              writable: true,
              value: `imagem-${timestamp}.${extension}`,
            })
          }
          
          await handleImageUpload(file)
        }
        return
      }
    }
    
    // Se não for imagem, permitir comportamento padrão (colar texto)
  }

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="doc-title" className="text-sm font-medium">
          Título
        </Label>
        <Input
          id="doc-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex: Como configurar VPN corporativa"
          className="text-lg font-semibold"
        />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <Label htmlFor="doc-summary" className="text-sm font-medium">
          Resumo
        </Label>
        <Textarea
          id="doc-summary"
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Breve descrição do documento..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Editor Markdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="doc-content" className="text-sm font-medium">
            Conteúdo (Markdown)
          </Label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 text-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3 mr-1.5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Image className="size-3 mr-1.5" />
                  Inserir imagem
                </>
              )}
            </Button>
          </div>
        </div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative"
        >
          <Textarea
            ref={textareaRef}
            id="doc-content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="# Título do documento

Comece escrevendo seu conteúdo aqui em Markdown..."
            rows={20}
            className={cn(
              "font-mono text-sm resize-none min-h-[300px] sm:min-h-[400px]",
              isDragging && "border-primary border-2"
            )}
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none border-2 border-dashed border-primary bg-primary/5 rounded-md m-1 z-10">
              <div className="text-center space-y-2">
                <Upload className="size-8 mx-auto text-primary" />
                <p className="text-sm font-medium text-primary">
                  Solte a imagem aqui
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Use <code className="px-1 py-0.5 bg-muted rounded text-xs">#</code>,{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">##</code> para títulos,{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">```</code> para código,{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">![texto](url)</code> para imagens.{" "}
          Você também pode colar imagens diretamente com <kbd className="px-1 py-0.5 bg-muted rounded text-xs border border-border">Ctrl+V</kbd>
        </p>
      </div>
    </div>
  )
}

interface DocPreviewProps {
  content: string
  title: string
}

export function DocPreview({ content, title }: DocPreviewProps) {
  if (!content.trim()) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Comece escrevendo para ver a prévia
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="prose-content">
      {title && (
        <h1 className="text-3xl font-bold mb-4 text-foreground">{title}</h1>
      )}
      <MarkdownRenderer content={content} />
    </div>
  )
}
