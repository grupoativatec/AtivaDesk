"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/tickets/rich-text-editor"
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

    // Criar mensagem otimista
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      createdAt: new Date(),
      author: {
        id: currentUserId,
        name: currentUserName,
        email: "",
      },
    }

    // Adicionar mensagem otimista imediatamente
    onMessageSent(optimisticMessage)
    setContent("")

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem")
      }

      // Substituir mensagem otimista pela real
      if (data.message) {
        onMessageSent(data.message)
      }
      toast.success("Mensagem enviada com sucesso!")
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.")
      // Em caso de erro, recarregar para remover a mensagem otimista
      onMessageSent(optimisticMessage) // Isso vai forçar um reload
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-border/50 pt-4 mt-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Digite sua mensagem..."
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !content.trim()} size="sm">
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="size-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
