"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  createCertificate,
  deleteCertificate,
  listCertificates,
  updateCertificate,
} from "@/lib/api/certificates"

type CertificateStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED" | "PENDING_RENEWAL"
type StatusFilter = "all" | "valid" | "expiring" | "expired"
type SortDirection = "asc" | "desc"
type SortKey = "domain" | "issuedAt" | "expiresAt" | "daysRemaining" | "status"
type PendingRenewalInput = "yes" | "no"

interface CertificateRecord {
  id: string
  domain: string
  subdomains: string[]
  issuedAt: string
  expiresAt: string
  pendingRenewal: boolean
}

interface CertificateTableItem extends CertificateRecord {
  daysRemaining: number
  status: CertificateStatus
}

interface CertificateFormState {
  domain: string
  subdomains: string
  issuedAt: string
  expiresAt: string
  pendingRenewal: PendingRenewalInput
}

const DAY_IN_MS = 86_400_000

const statusLabels: Record<CertificateStatus, string> = {
  VALID: "Válido",
  EXPIRING_SOON: "Próximo do vencimento",
  EXPIRED: "Expirado",
  PENDING_RENEWAL: "Renovação pendente",
}

function getDaysRemaining(expirationDate: string): number {
  const end = new Date(expirationDate).getTime()
  const now = Date.now()
  return Math.ceil((end - now) / DAY_IN_MS)
}

function resolveStatus(certificate: CertificateRecord, daysRemaining: number): CertificateStatus {
  if (daysRemaining < 0) {
    return "EXPIRED"
  }

  if (certificate.pendingRenewal) {
    return "PENDING_RENEWAL"
  }

  if (daysRemaining <= 30) {
    return "EXPIRING_SOON"
  }

  return "VALID"
}

function createInitialFormState(): CertificateFormState {
  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt.getTime() + 90 * DAY_IN_MS)

  return {
    domain: "",
    subdomains: "",
    issuedAt: format(issuedAt, "yyyy-MM-dd"),
    expiresAt: format(expiresAt, "yyyy-MM-dd"),
    pendingRenewal: "no",
  }
}

function toDateInput(isoDate: string): string {
  return format(new Date(isoDate), "yyyy-MM-dd")
}

function toIsoDate(inputDate: string): string {
  return new Date(`${inputDate}T00:00:00`).toISOString()
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSortChange,
}: {
  label: string
  sortKey: SortKey
  sort: { key: SortKey; direction: SortDirection }
  onSortChange: (key: SortKey) => void
}) {
  const isActive = sort.key === sortKey
  const Icon = isActive
    ? sort.direction === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown

  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      <button
        type="button"
        onClick={() => onSortChange(sortKey)}
        className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </th>
  )
}

function getStatusBadgeClass(status: CertificateStatus) {
  switch (status) {
    case "VALID":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
    case "EXPIRING_SOON":
      return "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400"
    case "EXPIRED":
      return "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400"
    case "PENDING_RENEWAL":
      return "bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400"
    default:
      return ""
  }
}

function getDaysRemainingBadgeClass(daysRemaining: number) {
  if (daysRemaining < 0) {
    return "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400"
  }

  if (daysRemaining <= 30) {
    return "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400"
  }

  return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
}

function getExpirationDateClass(daysRemaining: number) {
  if (daysRemaining < 0) {
    return "text-red-700 dark:text-red-400"
  }

  if (daysRemaining <= 30) {
    return "text-amber-700 dark:text-amber-400"
  }

  return "text-emerald-700 dark:text-emerald-400"
}

function formatDaysLabel(daysRemaining: number) {
  if (daysRemaining < 0) {
    const overdue = Math.abs(daysRemaining)
    return `${overdue} dia${overdue === 1 ? "" : "s"} atrasado`
  }

  return `${daysRemaining} dia${daysRemaining === 1 ? "" : "s"}`
}

function sortByStatus(status: CertificateStatus) {
  const statusOrder: Record<CertificateStatus, number> = {
    EXPIRED: 0,
    PENDING_RENEWAL: 1,
    EXPIRING_SOON: 2,
    VALID: 3,
  }

  return statusOrder[status]
}

export function CertificatesManagementShell() {
  const [records, setRecords] = useState<CertificateRecord[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "expiresAt",
    direction: "asc",
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<CertificateFormState>(createInitialFormState)
  const [certificateToDelete, setCertificateToDelete] = useState<CertificateRecord | null>(null)

  useEffect(() => {
    void loadCertificates()
  }, [])

  async function loadCertificates() {
    setIsLoadingRecords(true)
    try {
      const certificates = await listCertificates()
      setRecords(certificates)
    } catch (error) {
      console.error("Erro ao carregar certificados:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao carregar certificados")
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const certificates = useMemo<CertificateTableItem[]>(() => {
    return records.map((certificate) => {
      const daysRemaining = getDaysRemaining(certificate.expiresAt)
      return {
        ...certificate,
        daysRemaining,
        status: resolveStatus(certificate, daysRemaining),
      }
    })
  }, [records])

  const filteredCertificates = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return certificates.filter((certificate) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        certificate.domain.toLowerCase().includes(normalizedSearch) ||
        certificate.subdomains.some((subdomain) => subdomain.toLowerCase().includes(normalizedSearch))

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "valid" && certificate.status === "VALID") ||
        (statusFilter === "expiring" &&
          (certificate.status === "EXPIRING_SOON" || certificate.status === "PENDING_RENEWAL")) ||
        (statusFilter === "expired" && certificate.status === "EXPIRED")

      return matchesSearch && matchesStatus
    })
  }, [certificates, searchTerm, statusFilter])

  const sortedCertificates = useMemo(() => {
    const sorted = [...filteredCertificates]

    sorted.sort((left, right) => {
      let comparison = 0

      switch (sort.key) {
        case "domain":
          comparison = left.domain.localeCompare(right.domain, "pt-BR")
          break
        case "issuedAt":
          comparison = new Date(left.issuedAt).getTime() - new Date(right.issuedAt).getTime()
          break
        case "expiresAt":
          comparison = new Date(left.expiresAt).getTime() - new Date(right.expiresAt).getTime()
          break
        case "daysRemaining":
          comparison = left.daysRemaining - right.daysRemaining
          break
        case "status":
          comparison = sortByStatus(left.status) - sortByStatus(right.status)
          break
      }

      return sort.direction === "asc" ? comparison : -comparison
    })

    return sorted
  }, [filteredCertificates, sort])

  const handleSortChange = (key: SortKey) => {
    setSort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }

      return {
        key,
        direction: "asc",
      }
    })
  }

  const handleFilterChange = (value: StatusFilter) => {
    setStatusFilter(value)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormState(createInitialFormState())
    setIsModalOpen(true)
  }

  const openEditModal = (certificate: CertificateRecord) => {
    setEditingId(certificate.id)
    setFormState({
      domain: certificate.domain,
      subdomains: certificate.subdomains.join(", "),
      issuedAt: toDateInput(certificate.issuedAt),
      expiresAt: toDateInput(certificate.expiresAt),
      pendingRenewal: certificate.pendingRenewal ? "yes" : "no",
    })
    setIsModalOpen(true)
  }

  const confirmDeleteCertificate = async () => {
    if (!certificateToDelete) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteCertificate(certificateToDelete.id)
      toast.success(`Certificado ${certificateToDelete.domain} deletado`)
      setCertificateToDelete(null)
      await loadCertificates()
    } catch (error) {
      console.error("Erro ao deletar certificado:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao deletar certificado")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveCertificate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const domain = formState.domain.trim().toLowerCase()
    if (!domain) {
      toast.error("Informe o domínio")
      return
    }

    if (!formState.issuedAt || !formState.expiresAt) {
      toast.error("Informe as datas de emissão e vencimento")
      return
    }

    const issuedAt = toIsoDate(formState.issuedAt)
    const expiresAt = toIsoDate(formState.expiresAt)

    if (new Date(expiresAt).getTime() <= new Date(issuedAt).getTime()) {
      toast.error("A data de vencimento deve ser maior que a data de emissão")
      return
    }

    const subdomains = formState.subdomains
      .split(/[\n,]/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)

    try {
      setIsSaving(true)

      const payload = {
        domain,
        subdomains,
        issuedAt,
        expiresAt,
        pendingRenewal: formState.pendingRenewal === "yes",
      }

      if (editingId) {
        await updateCertificate(editingId, payload)
        toast.success("Certificado atualizado")
      } else {
        await createCertificate(payload)
        toast.success("Certificado adicionado")
      }

      await loadCertificates()
      setIsModalOpen(false)
      setEditingId(null)
      setFormState(createInitialFormState())
    } catch (error) {
      console.error("Erro ao salvar certificado:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar certificado")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full flex flex-col">
      <div className="border-b border-border/70 bg-card/95 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Gerenciamento de Certificados Let&apos;s Encrypt
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monitoramento e controle de vencimentos SSL
                </p>
              </div>
              <Button className="h-9 sm:h-10 shrink-0" onClick={openAddModal}>
                <Plus className="size-4" />
                Adicionar
              </Button>
            </div>

            <div className="flex flex-col gap-2.5 md:flex-row">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Buscar por domínio"
                  className="h-10 pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => handleFilterChange(value as StatusFilter)}>
                <SelectTrigger className="h-10 w-full md:w-[260px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="valid">Válidos</SelectItem>
                  <SelectItem value="expiring">Próximos do vencimento</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-muted/20 via-muted/10 to-background">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead className="sticky top-0 z-10 border-b border-border/80 bg-muted/90 backdrop-blur">
                  <tr>
                    <SortableHeader label="Domínio" sortKey="domain" sort={sort} onSortChange={handleSortChange} />
                    <SortableHeader
                      label="Data de Emissão"
                      sortKey="issuedAt"
                      sort={sort}
                      onSortChange={handleSortChange}
                    />
                    <SortableHeader
                      label="Data de Vencimento"
                      sortKey="expiresAt"
                      sort={sort}
                      onSortChange={handleSortChange}
                    />
                    <SortableHeader
                      label="Dias Restantes"
                      sortKey="daysRemaining"
                      sort={sort}
                      onSortChange={handleSortChange}
                    />
                    <SortableHeader label="Status" sortKey="status" sort={sort} onSortChange={handleSortChange} />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {isLoadingRecords ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Carregando certificados...
                      </td>
                    </tr>
                  ) : sortedCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                          <div className="rounded-full bg-muted p-3">
                            <Search className="size-5 text-muted-foreground" />
                          </div>
                          <h3 className="text-base font-semibold">Nenhum certificado encontrado</h3>
                          <p className="text-sm text-muted-foreground">
                            Ajuste os filtros ou pesquise por outro domínio.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSearchTerm("")
                              setStatusFilter("all")
                            }}
                          >
                            Limpar filtros
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedCertificates.map((certificate) => (
                      <tr key={certificate.id} className="transition-colors hover:bg-muted/35">
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{certificate.domain}</p>
                            <p className="text-xs text-muted-foreground">
                              {certificate.subdomains.length > 0
                                ? certificate.subdomains.join("  •  ")
                                : "Sem subdomínios adicionais"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-foreground">
                          {format(new Date(certificate.issuedAt), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={cn(
                              "font-semibold",
                              getExpirationDateClass(certificate.daysRemaining)
                            )}
                          >
                            {format(new Date(certificate.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge
                            variant="outline"
                            className={cn("font-semibold", getDaysRemainingBadgeClass(certificate.daysRemaining))}
                          >
                            {formatDaysLabel(certificate.daysRemaining)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge variant="outline" className={cn("font-medium", getStatusBadgeClass(certificate.status))}>
                            {statusLabels[certificate.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => openEditModal(certificate)}
                              disabled={isSaving || isDeleting}
                            >
                              <Pencil className="size-3.5" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => setCertificateToDelete(certificate)}
                              disabled={isSaving || isDeleting}
                            >
                              <Trash2 className="size-3.5" />
                              Deletar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) {
            setEditingId(null)
            setFormState(createInitialFormState())
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar certificado" : "Adicionar certificado"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do certificado para monitoramento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCertificate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certificate-domain">Domínio</Label>
              <Input
                id="certificate-domain"
                value={formState.domain}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, domain: event.target.value }))
                }
                placeholder="example.com"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate-subdomains">Subdomínios (separados por vírgula)</Label>
              <Input
                id="certificate-subdomains"
                value={formState.subdomains}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, subdomains: event.target.value }))
                }
                placeholder="www.example.com, api.example.com"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="certificate-issued-at">Data de emissão</Label>
                <Input
                  id="certificate-issued-at"
                  type="date"
                  value={formState.issuedAt}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, issuedAt: event.target.value }))
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate-expires-at">Data de vencimento</Label>
                <Input
                  id="certificate-expires-at"
                  type="date"
                  value={formState.expiresAt}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, expiresAt: event.target.value }))
                  }
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate-pending-renewal">Renovação pendente</Label>
              <Select
                value={formState.pendingRenewal}
                onValueChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    pendingRenewal: value as PendingRenewalInput,
                  }))
                }
                disabled={isSaving}
              >
                <SelectTrigger id="certificate-pending-renewal">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingId(null)
                  setFormState(createInitialFormState())
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!certificateToDelete} onOpenChange={(open) => !open && setCertificateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar certificado</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação irá remover o certificado
              {certificateToDelete ? ` ${certificateToDelete.domain}` : ""} da lista de monitoramento.
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDeleteCertificate}
              disabled={isDeleting}
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
