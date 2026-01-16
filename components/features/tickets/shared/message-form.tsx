"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/features/tickets/shared/rich-text-editor"
import { Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface MessageFormProps {
  ticketId: string
  currentUserId: string
  currentUserName: string
  onMessageSent: (message: {
    id: string
    content: string
    createdAt: string | Date
    author: {
      id: string
      name: string
      email: string
    }
  }) => void
}

export function MessageForm({ 
  ticketId, 
  currentUserId,
  currentUserName,
  onMessageSent 
}: MessageFormProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!content.trim() || content.replace(/<[^>]*>/g, "").trim().length === 0) {
      toast.error("Por favor, digite uma mensagem")
      return
    }

    const messageContent = content
    setLoading(true)

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      })

      // Verificar se a resposta é JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Resposta não é JSON:", text.substring(0, 200))
        throw new Error("Resposta inválida do servidor")
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem")
      }

      // Limpar o campo de conteúdo imediatamente após sucesso
      setContent("")

      // Adicionar mensagem real em tempo real
      if (data.message) {
        onMessageSent(data.message)
        toast.success("Mensagem enviada com sucesso!")
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2">
      <div className="border rounded-lg">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Digite sua mensagem..."
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !content.trim()} size="sm" className="h-7 sm:h-8 text-xs px-2 sm:px-3">
          {loading ? (
            <>
              <Loader2 className="size-3 sm:size-4 mr-1 sm:mr-1.5 animate-spin" />
              <span className="hidden sm:inline">Enviando...</span>
            </>
          ) : (
            <>
              <Send className="size-3 sm:size-4 mr-1 sm:mr-1.5" />
              <span>Enviar</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
