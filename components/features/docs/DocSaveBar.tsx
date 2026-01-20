"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Save, X, Globe } from "lucide-react"
import { format } from "date-fns"
import type { DocStatus } from "./DocCard"

interface DocSaveBarProps {
  isDirty: boolean
  status: DocStatus
  lastSaved?: Date
  onCancel: () => void
  onSaveDraft: () => void
  onPublish: () => void
  isSaving?: boolean
}

export function DocSaveBar({
  isDirty,
  status,
  lastSaved,
  onCancel,
  onSaveDraft,
  onPublish,
  isSaving = false,
}: DocSaveBarProps) {
  const formatLastSaved = () => {
    if (!lastSaved) return "nunca"
    const now = new Date()
    const diffMs = now.getTime() - lastSaved.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "agora"
    if (diffMins === 1) return "há 1 minuto"
    if (diffMins < 60) return `há ${diffMins} minutos`

    return format(lastSaved, "HH:mm")
  }

  return (
    <Card className="sticky bottom-0 z-50 border-t rounded-none border-b-0 border-l-0 border-r-0 rounded-t-lg shadow-lg">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Esquerda: Cancelar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="size-4 mr-2" />
          Cancelar
        </Button>

        {/* Centro: Status de salvamento */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-500">
              Não salvo
            </span>
          ) : (
            <span>Salvo</span>
          )}
          {lastSaved && (
            <>
              <span>•</span>
              <span>Última alteração: {formatLastSaved()}</span>
            </>
          )}
        </div>

        {/* Direita: Ações */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving || !isDirty}
          >
            <Save className="size-4 mr-2" />
            Salvar rascunho
          </Button>
          <Button
            size="sm"
            onClick={onPublish}
            disabled={isSaving || !isDirty}
          >
            <Globe className="size-4 mr-2" />
            {status === "published" ? "Atualizar publicação" : "Publicar"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
