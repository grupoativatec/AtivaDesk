"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { fetchJson } from "@/lib/http"

export function CreateCategoryDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onCreated: () => void
}) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("Informe o nome da categoria")
            return
        }

        setLoading(true)
        try {
            await fetchJson("/api/admin/trilhas/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })

            toast.success("Categoria criada com sucesso")
            setName("")
            onOpenChange(false)
            onCreated()
        } catch (e: any) {
            toast.error(e.message || "Erro ao criar categoria")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Nova categoria</AlertDialogTitle>
                </AlertDialogHeader>

                <Input
                    placeholder="Nome da categoria"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreate} disabled={loading}>
                        Criar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
