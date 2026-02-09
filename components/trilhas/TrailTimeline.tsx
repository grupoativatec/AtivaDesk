"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TimelineStep {
    id: string
    title: string
    level: number
}

interface TrailTimelineProps {
    steps: TimelineStep[]
}

export default function TrailTimeline({ steps }: TrailTimelineProps) {
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            {
                rootMargin: "-10% 0% -20% 0%",
                threshold: 0.1, // Menor threshold para garantir que pegue o Feedback form
            }
        )

        steps.forEach((step) => {
            const element = document.getElementById(step.id)
            if (element) observer.observe(element)
        })

        // Observar também o form de feedback
        const feedbackEl = document.getElementById("feedback-form")
        if (feedbackEl) observer.observe(feedbackEl)

        return () => observer.disconnect()
    }, [steps])

    // Achar o index do passo atual para a linha de progresso
    const currentIndex = steps.findIndex(s => s.id === activeId)
    const isFeedbackActive = activeId === "feedback-form"

    return (
        <aside className="mt-6 space-y-4">
            <h3 className="px-1 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Neste Post
            </h3>

            <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <div className="relative space-y-6">
                    {/* Linha vertical de fundo */}
                    <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-0.5 bg-slate-100" />

                    {/* Linha vertical de progresso (animada) */}
                    <motion.div
                        className="absolute left-[11px] top-2 w-0.5 bg-sky-500 origin-top"
                        initial={{ scaleY: 0 }}
                        animate={{
                            scaleY: isFeedbackActive
                                ? 1
                                : currentIndex === -1 ? 0 : (currentIndex) / (steps.length)
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                            height: "calc(100% - 16px)",
                            display: steps.length === 0 ? "none" : "block"
                        }}
                    />

                    <div className="relative space-y-6">
                        {steps.map((step, index) => {
                            const isActive = step.id === activeId
                            const isPast = currentIndex > index || isFeedbackActive

                            return (
                                <div
                                    key={step.id}
                                    className="group relative flex items-start gap-4 transition-all duration-300"
                                >
                                    {/* Icone / Dot */}
                                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                                        <div className={cn(
                                            "h-2.5 w-2.5 rounded-full border-2 transition-all duration-300",
                                            isActive ? "scale-125 border-sky-500 bg-sky-500 ring-4 ring-sky-100" :
                                                isPast ? "border-sky-500 bg-sky-500" :
                                                    "border-slate-300 bg-white group-hover:border-slate-400"
                                        )} />
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="min-w-0 flex-1 pt-0.5">
                                        <a
                                            href={`#${step.id}`}
                                            className={cn(
                                                "text-xs font-medium transition-colors line-clamp-2",
                                                isActive ? "text-sky-600 font-semibold" :
                                                    isPast ? "text-slate-900" :
                                                        "text-slate-500 hover:text-slate-700"
                                            )}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                document.getElementById(step.id)?.scrollIntoView({
                                                    behavior: "smooth",
                                                    block: "start"
                                                })
                                            }}
                                        >
                                            {step.title}
                                        </a>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Passo fixo de Feedback */}
                        <div className="group relative flex items-start gap-4 transition-all duration-300">
                            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                                <div className={cn(
                                    "h-2.5 w-2.5 rounded-full border-2 transition-all duration-300",
                                    isFeedbackActive ? "scale-125 border-sky-500 bg-sky-500 ring-4 ring-sky-100" :
                                        "border-slate-300 bg-white group-hover:border-slate-400"
                                )} />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                                <a
                                    href="#feedback-form"
                                    className={cn(
                                        "text-xs font-medium transition-colors line-clamp-1",
                                        isFeedbackActive ? "text-sky-600 font-semibold" : "text-slate-500 hover:text-slate-700"
                                    )}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        document.getElementById("feedback-form")?.scrollIntoView({
                                            behavior: "smooth"
                                        })
                                    }}
                                >
                                    Enviar Feedback
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
