"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Image as ImageIcon,
  Monitor,
  Paperclip,
  X
} from "lucide-react"
import { useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { toPng } from "html-to-image"
import { toast } from "sonner"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  error?: boolean
  placeholder?: string
}

export function RichTextEditor({ 
  content, 
  onChange, 
  error,
  placeholder = "Descreva o problema em detalhes..." 
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
      editorProps: {
        attributes: {
          class: cn(
            "min-h-[80px] max-h-[200px] p-3 focus:outline-none overflow-y-auto",
            "[&_p]:my-1 [&_p]:leading-relaxed",
            "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1",
            "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:space-y-1",
            "[&_li]:my-0.5",
            "[&_strong]:font-semibold [&_em]:italic",
            "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
            "[&_img]:max-w-full [&_img]:max-h-[200px] [&_img]:object-contain [&_img]:rounded-md [&_img]:my-2 [&_img]:border [&_img]:border-border",
            "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:my-2",
            "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2",
            "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-1"
          ),
        },
      },
  })

  // Validações de segurança
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"]
  const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ]
  const ALLOWED_EXTENSIONS = [
    // Imagens
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
    // Documentos
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv",
  ]
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const validateFile = (file: File): string | null => {
    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande. Tamanho máximo: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    }

    // Validar extensão
    const extension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return "Tipo de arquivo não permitido. Use apenas imagens, PDFs ou documentos."
    }

    // Validar tipo MIME
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isAllowedFile = ALLOWED_FILE_TYPES.includes(file.type)
    
    if (!isImage && !isAllowedFile) {
      return "Tipo de arquivo não permitido. Use apenas imagens, PDFs ou documentos."
    }

    // Validar que extensão corresponde ao tipo MIME
    if (isImage && !extension.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      return "Extensão do arquivo não corresponde ao tipo de imagem."
    }

    if (isAllowedFile && !extension.match(/\.(pdf|doc|docx|xls|xlsx|txt|csv)$/i)) {
      return "Extensão do arquivo não corresponde ao tipo de documento."
    }

    return null
  }

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return

    // Validar arquivo antes de processar
    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Se for imagem, inserir como imagem
    if (file.type.startsWith("image/") && ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        editor.chain().focus().setImage({ src }).run()
      }
      reader.onerror = () => {
        toast.error("Erro ao ler o arquivo de imagem.")
      }
      reader.readAsDataURL(file)
    } else {
      // Se for outro tipo de arquivo, fazer upload e criar link
      try {
        const formData = new FormData()
        formData.append("file", file)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await uploadRes.json()

        if (!uploadRes.ok) {
          throw new Error(data.error || "Erro ao fazer upload do arquivo")
        }

        // Inserir link no editor com atributo data-file-url
        editor
          .chain()
          .focus()
          .insertContent(
            `<a href="${data.url}" data-file-url="${data.url}" target="_blank" rel="noopener noreferrer">📎 ${file.name}</a>`
          )
          .run()
      } catch (error: any) {
        console.error("Erro ao fazer upload:", error)
        toast.error(error.message || "Erro ao fazer upload do arquivo. Tente novamente.")
      }
    }
  }, [editor])

  const handleScreenshot = useCallback(async () => {
    try {
      // Tentar usar a API nativa do navegador primeiro
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: "screen" } as any,
        })
        
        const video = document.createElement("video")
        video.srcObject = stream
        video.play()
        
        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const dataUrl = canvas.toDataURL("image/png")
            
            if (editor) {
              editor.chain().focus().setImage({ src: dataUrl }).run()
            }
            
            stream.getTracks().forEach(track => track.stop())
          }
        }
      } else {
        // Fallback: capturar a página inteira
        const canvas = await toPng(document.body, {
          quality: 0.8,
          pixelRatio: 1,
        })
        
        if (editor) {
          editor.chain().focus().setImage({ src: canvas }).run()
        }
      }
    } catch (error) {
      console.error("Erro ao capturar tela:", error)
      // Se falhar, tentar capturar a página
      try {
        const canvas = await toPng(document.body, {
          quality: 0.8,
          pixelRatio: 1,
        })
        if (editor) {
          editor.chain().focus().setImage({ src: canvas }).run()
        }
      } catch (fallbackError) {
        console.error("Erro no fallback:", fallbackError)
      }
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL:", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={cn(
      "border rounded-md overflow-hidden transition-colors",
      error 
        ? "border-destructive ring-destructive/20 dark:ring-destructive/40 ring-[3px]" 
        : "border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
      "dark:bg-input/30"
    )}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            editor.isActive("bold") && "bg-accent"
          )}
        >
          <Bold className="size-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            editor.isActive("italic") && "bg-accent"
          )}
        >
          <Italic className="size-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            editor.isActive("bulletList") && "bg-accent"
          )}
        >
          <List className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            editor.isActive("orderedList") && "bg-accent"
          )}
        >
          <ListOrdered className="size-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={setLink}
          className={cn(
            editor.isActive("link") && "bg-accent"
          )}
        >
          <LinkIcon className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => fileInputRef.current?.click()}
          title="Inserir imagem"
        >
          <ImageIcon className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => attachmentInputRef.current?.click()}
          title="Anexar arquivo"
        >
          <Paperclip className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleScreenshot}
          title="Capturar tela"
        >
          <Monitor className="size-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
        />

        {/* Placeholder */}
        {editor.isEmpty && (
          <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground text-sm">
            {placeholder}
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file)
          }
          // Reset input para permitir selecionar o mesmo arquivo novamente
          e.target.value = ""
        }}
      />
      <input
        ref={attachmentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file)
          }
          // Reset input para permitir selecionar o mesmo arquivo novamente
          e.target.value = ""
        }}
      />
    </div>
  )
}
