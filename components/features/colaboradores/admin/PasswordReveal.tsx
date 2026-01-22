"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Key } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface PasswordRevealProps {
  colaboradorId: string
  hasPassword: boolean
}

export function PasswordReveal({ colaboradorId, hasPassword }: PasswordRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [password, setPassword] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false)
      setPassword(null)
      return
    }

    if (!hasPassword) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/colaboradores/${colaboradorId}/decrypt-password`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao descriptografar senha")
      }

      setPassword(data.senha || "")
      setIsRevealed(true)
    } catch (error: any) {
      console.error("Erro ao revelar senha:", error)
      toast.error(error.message || "Erro ao revelar senha")
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasPassword) {
    return (
      <span className="text-xs text-muted-foreground">-</span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {isRevealed ? (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-2"
          >
            <motion.code
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded break-all"
            >
              {password || "••••••••"}
            </motion.code>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReveal}
                className="h-6 w-6 p-0 shrink-0"
                title="Ocultar senha"
              >
                <EyeOff className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReveal}
              disabled={isLoading}
              className="h-6 w-6 p-0 shrink-0"
              title="Revelar senha"
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : {}}
                transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                {isLoading ? (
                  <Key className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
