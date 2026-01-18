"use client"

import { Activity } from "lucide-react"

export function TaskActivityEmptyState() {
    return (
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-12 shadow-sm dark:shadow-none">
            <div className="text-center">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Activity className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma atividade registrada ainda
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Edite a tarefa ou registre apontamentos para gerar histórico de atividade.
                </p>
            </div>
        </div>
    )
}
