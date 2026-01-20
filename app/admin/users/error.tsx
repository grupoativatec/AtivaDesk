"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Erro na página de usuários:", error)
  }, [error])

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Erro ao carregar usuários
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
            </p>
          </div>
          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
