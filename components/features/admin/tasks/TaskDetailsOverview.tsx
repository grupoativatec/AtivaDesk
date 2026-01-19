"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FileText, CheckSquare, Edit, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskDetailsOverviewProps {
    description: string
    acceptance?: string | null
    isEditing?: boolean
    onAcceptanceChange?: (acceptance: string | null) => void
}

export function TaskDetailsOverview({ 
    description, 
    acceptance,
    isEditing = false,
    onAcceptanceChange 
}: TaskDetailsOverviewProps) {
    const [isEditingAcceptance, setIsEditingAcceptance] = useState(false)
    const [localAcceptance, setLocalAcceptance] = useState(acceptance || "")

    const handleSaveAcceptance = () => {
        if (onAcceptanceChange) {
            onAcceptanceChange(localAcceptance.trim() || null)
        }
        setIsEditingAcceptance(false)
    }

    const handleCancelAcceptance = () => {
        setLocalAcceptance(acceptance || "")
        setIsEditingAcceptance(false)
    }

    return (
        <div className="space-y-4">
            {/* Descrição */}
            <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 sm:p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-3">
                    <FileText className="size-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Descrição</h3>
                </div>
                <Separator className="mb-4" />
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    {description && description !== "Nenhuma descrição fornecida." ? (
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {description}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            Nenhuma descrição fornecida.
                        </p>
                    )}
                </div>
            </div>

            {/* Critérios de aceite */}
            <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 sm:p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="size-5 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Critérios de aceite</h3>
                    </div>
                    {isEditing && !isEditingAcceptance && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingAcceptance(true)}
                            className="h-7 text-xs"
                        >
                            <Edit className="size-3.5 mr-1.5" />
                            Editar
                        </Button>
                    )}
                </div>
                <Separator className="mb-4" />
                {isEditing && isEditingAcceptance ? (
                    <div className="space-y-3">
                        <Textarea
                            value={localAcceptance}
                            onChange={(e) => setLocalAcceptance(e.target.value)}
                            placeholder="Digite os critérios de aceite da tarefa..."
                            className="min-h-[120px] resize-none"
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleSaveAcceptance}
                                className="h-8 text-xs"
                            >
                                <Save className="size-3.5 mr-1.5" />
                                Salvar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelAcceptance}
                                className="h-8 text-xs"
                            >
                                <X className="size-3.5 mr-1.5" />
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {acceptance && acceptance.trim() ? (
                            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                {acceptance}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                Nenhum critério de aceite definido.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
