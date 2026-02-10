"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MessageSquarePlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function TextSelectionFeedback() {
    const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    const handleSelection = useCallback(() => {
        const sel = window.getSelection()

        // If clicking inside the popover, don't clear selection
        if (popoverRef.current?.contains(document.activeElement)) return

        if (sel && sel.toString().trim().length > 5) {
            try {
                const range = sel.getRangeAt(0)

                // RESTRICTION: Only show if selection is inside #trail-content
                const container = document.getElementById("trail-content")
                if (!container || !container.contains(range.commonAncestorContainer)) {
                    setSelection(null)
                    return
                }

                const rects = range.getClientRects()

                if (rects.length > 0) {
                    // We use the first rect to position the popover above the start of selection
                    const rect = rects[0]
                    setSelection({
                        text: sel.toString().trim(),
                        x: rect.left + rect.width / 2,
                        y: rect.top - 12
                    })
                }
            } catch (e) {
                // Ignore errors related to range selection in some edge cases
            }
        } else {
            setSelection(null)
        }
    }, [])

    useEffect(() => {
        document.addEventListener("mouseup", handleSelection)
        // Also handle keyboard selection if needed
        document.addEventListener("keyup", handleSelection)

        return () => {
            document.removeEventListener("mouseup", handleSelection)
            document.removeEventListener("keyup", handleSelection)
        }
    }, [handleSelection])

    const handleClick = () => {
        if (!selection) return

        // Dispatch custom event to FeedbackForm
        const event = new CustomEvent("set-feedback-text", { detail: selection.text })
        window.dispatchEvent(event)

        // Scroll to feedback form
        const form = document.getElementById("feedback-form")
        if (form) {
            form.scrollIntoView({ behavior: "smooth", block: "center" })

            // Focus textarea after scroll
            setTimeout(() => {
                const textarea = document.getElementById("comment") as HTMLTextAreaElement
                if (textarea) {
                    textarea.focus()
                    // Place cursor at the end
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
                }
            }, 800)
        }

        // Clear selection to hide popover
        setSelection(null)
        window.getSelection()?.removeAllRanges()
    }

    return (
        <AnimatePresence>
            {selection && (
                <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: 5, scale: 0.9, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, y: 5, scale: 0.9, x: "-50%" }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 400,
                        opacity: { duration: 0.15 }
                    }}
                    className="fixed z-[100] pointer-events-auto"
                    style={{ left: selection.x, top: selection.y - 8 }}
                >
                    <div className="relative group">
                        {/* Glassmorphism Pill */}
                        <div className="flex items-center gap-1 overflow-hidden rounded-full bg-slate-900/95 backdrop-blur-md px-1 py-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-white/10">
                            <button
                                onClick={handleClick}
                                title="Enviar dúvida sobre este trecho"
                                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium text-white transition-all hover:bg-white/10 active:scale-95 whitespace-nowrap"
                            >
                                <MessageSquarePlus className="h-3.5 w-3.5 text-sky-400" />
                                <span>Tire sua dúvida</span>
                            </button>

                            <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(selection.text)
                                    setSelection(null)
                                }}
                                title="Copiar texto"
                                className="flex items-center justify-center rounded-full p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-90"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                            </button>
                        </div>

                        {/* Triangular Arrow */}
                        <div className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-slate-900/95 border-b border-r border-white/10" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
