"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { timeEntrySchema, TimeEntryFormData } from "./time-entry.schema"
import { TIME_ENTRY_TYPE_LABELS, TimeEntryType } from "./time-entry.types"
import { listAdmins } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Assignee } from "../task.types"

interface TimeEntryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    taskId: string
    onSuccess: (data: TimeEntryFormData) => void
}

export function TimeEntryModal({
    open,
    onOpenChange,
    taskId,
    onSuccess,
}: TimeEntryModalProps) {
    const [availableAssignees, setAvailableAssignees] = useState<Assignee[]>([])
    const [isLoadingAssignees, setIsLoadingAssignees] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<TimeEntryFormData>>(() => {
        const today = new Date().toISOString().split("T")[0]
        return {
            date: today,
            hours: 2,
            type: "DEV",
            userId: "",
            userName: "",
        }
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Carregar assignees do backend quando modal abrir
    useEffect(() => {
        if (open) {
            async function loadAssignees() {
                setIsLoadingAssignees(true)
                try {
                    const admins = await listAdmins()
                    const assignees = admins.map((admin) => ({
                        id: admin.id,
                        name: admin.name,
                    }))
                    setAvailableAssignees(assignees)

                    // Se não houver userId selecionado, usar o primeiro admin
                    setFormData((prev) => {
                        if (!prev.userId && assignees.length > 0) {
                            return {
                                ...prev,
                                userId: assignees[0].id,
                                userName: assignees[0].name,
                            }
                        }
                        return prev
                    })
                } catch (error) {
                    console.error("Erro ao carregar usuários:", error)
                    toast.error("Erro ao carregar usuários")
                } finally {
                    setIsLoadingAssignees(false)
                }
            }

            loadAssignees()
        }
    }, [open])

    // Resetar form quando modal abre
    useEffect(() => {
        if (open) {
            const today = new Date().toISOString().split("T")[0]
            setFormData((prev) => ({
                date: today,
                hours: 2,
                type: "DEV",
                userId: prev.userId || "",
                userName: prev.userName || "",
                note: "",
            }))
            setErrors({})
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Validar
        const validation = timeEntrySchema.safeParse(formData)
        if (!validation.success) {
            const newErrors: Record<string, string> = {}
            validation.error.issues.forEach((err) => {
                if (err.path[0]) {
                    newErrors[err.path[0].toString()] = err.message
                }
            })
            setErrors(newErrors)
            toast.error("Por favor, corrija os erros no formulário")
            return
        }

        setLoading(true)

        try {
            // Simular delay de API
            await new Promise((resolve) => setTimeout(resolve, 300))

            // Chamar callback de sucesso com os dados validados
            onSuccess(validation.data)

            onOpenChange(false)
        } catch (error) {
            console.error("Erro ao salvar apontamento:", error)
            toast.error("Erro ao salvar apontamento")
        } finally {
            setLoading(false)
        }
    }

    const handleUserChange = (userId: string) => {
        const assignee = availableAssignees.find((a) => a.id === userId)
        if (assignee) {
            setFormData({
                ...formData,
                userId: assignee.id,
                userName: assignee.name,
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Apontar horas</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Data *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date || ""}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className={errors.date ? "border-destructive" : ""}
                        />
                        {errors.date && (
                            <p className="text-xs text-destructive">{errors.date}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hours">Horas *</Label>
                        <Input
                            id="hours"
                            type="number"
                            min="0.5"
                            max="12"
                            step="0.5"
                            value={formData.hours || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    hours: parseFloat(e.target.value) || 0,
                                })
                            }
                            className={errors.hours ? "border-destructive" : ""}
                        />
                        {errors.hours && (
                            <p className="text-xs text-destructive">{errors.hours}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Mínimo: 0.5h, Máximo: 12h, Múltiplos de 0.5
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, type: value as TimeEntryType })
                            }
                        >
                            <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TIME_ENTRY_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <p className="text-xs text-destructive">{errors.type}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user">Usuário *</Label>
                        <Select
                            value={formData.userId || ""}
                            onValueChange={handleUserChange}
                            disabled={isLoadingAssignees}
                        >
                            <SelectTrigger className={errors.userId ? "border-destructive" : ""}>
                                <SelectValue
                                    placeholder={isLoadingAssignees ? "Carregando..." : "Selecione um usuário"}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {availableAssignees.map((assignee) => (
                                    <SelectItem key={assignee.id} value={assignee.id}>
                                        {assignee.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.userId && (
                            <p className="text-xs text-destructive">{errors.userId}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Observação (opcional)</Label>
                        <textarea
                            id="note"
                            value={formData.note || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, note: e.target.value })
                            }
                            rows={3}
                            maxLength={500}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.note?.length || 0}/500 caracteres
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
