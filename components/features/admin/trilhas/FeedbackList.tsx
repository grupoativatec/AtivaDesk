"use client"

import { Star, MessageSquare, Calendar, Folder } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Feedback {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    post: {
        title: string
        slug: string
        category: {
            name: string
            color: string | null
        }
    }
}

interface FeedbackListProps {
    feedbacks: Feedback[]
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
    if (feedbacks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Nenhum feedback ainda</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-1">
                    Feedbacks aparecerão aqui assim que os usuários começarem a avaliar suas trilhas.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {feedbacks.map((f, i) => (
                <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <Card className="h-full border-border/50 hover:border-border transition-colors">
                        <CardContent className="p-5 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-3">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-slate-900 line-clamp-1">{f.post.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Folder className="h-3 w-3" />
                                            <span
                                                className="font-medium"
                                                style={{ color: f.post.category.color || undefined }}
                                            >
                                                {f.post.category.name}
                                            </span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {format(new Date(f.createdAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`h-3.5 w-3.5 ${s <= f.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-slate-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {f.comment ? (
                                <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 italic flex-1">
                                    "{f.comment}"
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-slate-400 bg-slate-50/50 rounded-lg p-3 border border-dashed flex-1 flex items-center justify-center">
                                    Nenhum comentário
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
