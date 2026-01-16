"use client"

import { TimeEntry } from "./time-entry.types"
import { TIME_ENTRY_TYPE_LABELS } from "./time-entry.types"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Calendar, User, Clock, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface TimeEntriesTableProps {
    entries: TimeEntry[]
    onDelete: (entryId: string) => void
    entryToDelete?: TimeEntry | null
    isDeleting?: boolean
    onDeleteConfirm: () => void
    onDeleteCancel: () => void
}

export function TimeEntriesTable({
    entries,
    onDelete,
    entryToDelete,
    isDeleting = false,
    onDeleteConfirm,
    onDeleteCancel,
}: TimeEntriesTableProps) {
    if (entries.length === 0) {
        return null
    }

    const entryBeingDeleted = entryToDelete

    return (
        <>
            {/* Tabela Desktop */}
            <div className="hidden lg:block">
                <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 dark:bg-muted/10 border-b border-border dark:border-border/30">
                                <tr>
                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Horas
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Observação
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-border/20">
                                {entries.map((entry) => {
                                    const entryDate = new Date(entry.date)

                                    return (
                                        <tr
                                            key={entry.id}
                                            className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="size-4 text-muted-foreground" />
                                                    <span className="text-foreground">
                                                        {format(entryDate, "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="size-4 text-muted-foreground" />
                                                    <span className="text-foreground">{entry.userName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded">
                                                    {TIME_ENTRY_TYPE_LABELS[entry.type]}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                    <Clock className="size-4 text-muted-foreground" />
                                                    <span>{entry.hours}h</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {entry.note ? (
                                                    <div className="flex items-start gap-2 text-sm text-muted-foreground max-w-md">
                                                        <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2">{entry.note}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(entry.id)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Cards Mobile */}
            <div className="lg:hidden space-y-4">
                {entries.map((entry) => {
                    const entryDate = new Date(entry.date)

                    return (
                        <div
                            key={entry.id}
                            className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        <span className="text-sm font-semibold text-foreground">
                                            {format(entryDate, "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="size-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">{entry.userName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded">
                                            {TIME_ENTRY_TYPE_LABELS[entry.type]}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="size-3.5 text-muted-foreground" />
                                            <span className="text-sm font-semibold text-foreground">
                                                {entry.hours}h
                                            </span>
                                        </div>
                                    </div>
                                    {entry.note && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            <FileText className="size-3.5 inline mr-1" />
                                            {entry.note}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(entry.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* AlertDialog para confirmação de exclusão */}
            <AlertDialog open={!!entryToDelete} onOpenChange={(open: boolean) => !open && onDeleteCancel()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir apontamento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este apontamento?
                            {entryBeingDeleted && (
                                <>
                                    <br />
                                    <span className="font-medium">
                                        {format(new Date(entryBeingDeleted.date), "dd/MM/yyyy", {
                                            locale: ptBR,
                                        })}{" "}
                                        • {entryBeingDeleted.hours}h • {entryBeingDeleted.userName}
                                    </span>
                                </>
                            )}
                            <br />
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onDeleteCancel} disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                "Excluir"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
