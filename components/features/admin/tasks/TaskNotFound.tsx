"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"

export function TaskNotFound() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo)
    } else {
      router.push("/admin/tarefas")
    }
  }

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Tarefa não encontrada
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            A tarefa que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="size-4 mr-2" />
            Voltar para Tarefas
          </Button>
        </div>
      </div>
    </div>
  )
}
