"use client"

import { Separator } from "@/components/ui/separator"
import { FileText, CheckSquare } from "lucide-react"

interface TaskDetailsOverviewProps {
    description: string
}

export function TaskDetailsOverview({ description }: TaskDetailsOverviewProps) {
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
                <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="size-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Critérios de aceite</h3>
                </div>
                <Separator className="mb-4" />
                <div className="text-sm text-muted-foreground italic">
                    Em breve: critérios de aceite serão exibidos aqui
                </div>
            </div>
        </div>
    )
}
