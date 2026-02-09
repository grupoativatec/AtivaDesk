"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface FeedbackFormProps {
    postId: string
}

export default function FeedbackForm({ postId }: FeedbackFormProps) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error("Por favor, selecione uma nota.")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/trilhas/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, rating, comment }),
            })

            if (!res.ok) throw new Error()

            setSubmitted(true)
            toast.success("Feedback enviado com sucesso! Obrigado.")
        } catch (error) {
            toast.error("Erro ao enviar feedback. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div id="feedback-form" className="mt-12 rounded-xl bg-sky-50 p-6 text-center ring-1 ring-sky-100">
                <h3 className="text-lg font-semibold text-sky-900">Obrigado pelo seu feedback!</h3>
                <p className="mt-1 text-sm text-sky-700">Sua opinião é muito importante para nós.</p>
            </div>
        )
    }

    return (
        <section id="feedback-form" className="mt-12 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                O que você achou desta trilha?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
                Seu feedback é anônimo e nos ajuda a melhorar o conteúdo.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="group relative cursor-pointer"
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`h-8 w-8 transition-colors ${star <= (hover || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-300 group-hover:text-yellow-400"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium text-slate-700">
                        Observações (opcional)
                    </label>
                    <Textarea
                        id="comment"
                        placeholder="Conte-nos um pouco mais sobre sua experiência..."
                        className="min-h-[100px] resize-none"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="bg-sky-600 hover:bg-sky-700"
                    >
                        {isSubmitting ? "Enviando..." : "Enviar Feedback"}
                    </Button>
                </div>
            </form>
        </section>
    )
}
