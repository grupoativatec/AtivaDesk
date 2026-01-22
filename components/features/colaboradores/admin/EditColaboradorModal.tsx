"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const editColaboradorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  senha: z.string().optional(),
  departamento: z.string().optional(),
  categoriaId: z.string().optional(),
})

type EditColaboradorFormData = z.infer<typeof editColaboradorSchema>

interface ColaboradorExterno {
  id: string
  nome: string
  email: string | null
  senha: string | null
  departamento: string | null
  categoriaId: string | null
  categoria: {
    id: string
    nome: string
  } | null
  ativo: boolean
}

interface EditColaboradorModalProps {
  colaborador: ColaboradorExterno
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditColaboradorModal({
  colaborador,
  open,
  onOpenChange,
  onSuccess,
}: EditColaboradorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditColaboradorFormData>({
    resolver: zodResolver(editColaboradorSchema),
    defaultValues: {
      nome: colaborador.nome,
      email: colaborador.email || "",
      senha: colaborador.senha || "",
      departamento: colaborador.departamento || "",
      categoriaId: colaborador.categoriaId || "none",
    },
  })

  // Buscar categorias
  useEffect(() => {
    if (open) {
      setLoadingCategorias(true)
      fetch("/api/admin/colaboradores/categorias")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setCategorias(data.categorias || [])
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar categorias:", error)
        })
        .finally(() => {
          setLoadingCategorias(false)
        })
    }
  }, [open])

  // Reset form quando colaborador muda
  useEffect(() => {
    if (open && colaborador) {
      reset({
        nome: colaborador.nome,
        email: colaborador.email || "",
        senha: colaborador.senha || "",
        departamento: colaborador.departamento || "",
        categoriaId: colaborador.categoriaId || "none",
      })
    }
  }, [open, colaborador, reset])

  const categoriaId = watch("categoriaId")

  const onSubmit = async (data: EditColaboradorFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/colaboradores/${colaborador.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: data.nome.trim(),
          email: data.email?.trim() || null,
          senha: data.senha?.trim() || null,
          departamento: data.departamento?.trim() || null,
          categoriaId: data.categoriaId && data.categoriaId !== "none" ? data.categoriaId : null,
        }),
      })

      const response = await res.json()

      if (!res.ok) {
        throw new Error(response.error || "Erro ao atualizar colaborador")
      }

      toast.success("Colaborador atualizado com sucesso!")
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Erro ao atualizar colaborador:", error)
      toast.error(error.message || "Erro ao atualizar colaborador")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1.5 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Editar Colaborador</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Atualize as informações do colaborador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          {/* Nome */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="nome" className="text-xs sm:text-sm font-medium">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome"
              {...register("nome")}
              placeholder="Nome completo do colaborador"
              disabled={isSubmitting}
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
            {errors.nome && (
              <p className="text-xs sm:text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@exemplo.com"
              disabled={isSubmitting}
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
            {errors.email && (
              <p className="text-xs sm:text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Departamento */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="departamento" className="text-xs sm:text-sm font-medium">Departamento</Label>
              <Input
                id="departamento"
                {...register("departamento")}
                placeholder="Departamento (opcional)"
                disabled={isSubmitting}
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="categoriaId" className="text-xs sm:text-sm font-medium">Categoria</Label>
              <Select
                value={categoriaId || "none"}
                onValueChange={(value) => setValue("categoriaId", value === "none" ? undefined : value)}
                disabled={isSubmitting || loadingCategorias}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue placeholder={loadingCategorias ? "Carregando..." : "Selecione uma categoria"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="senha" className="text-xs sm:text-sm font-medium">Senha de Acesso</Label>
            <Input
              id="senha"
              type="text"
              {...register("senha")}
              placeholder="Senha de acesso (opcional)"
              disabled={isSubmitting}
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              Senha definida para o colaborador acessar sistemas ou redes.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base order-1 sm:order-2"
            >
              {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
