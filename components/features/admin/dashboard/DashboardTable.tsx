"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  GripVertical,
  LayoutGrid,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface DashboardTableProps {
  tickets: Array<{
    id: string
    title: string
    status: string
    priority: string
    category: string
    unit: string
    assignee?: {
      id: string
      name: string
    } | null
    createdAt: string
  }>
  loading?: boolean
}

type TabType = "recent" | "urgent" | "assigned" | "all"

export function DashboardTable({ tickets, loading }: DashboardTableProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("recent")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const getFilteredTickets = () => {
    switch (activeTab) {
      case "urgent":
        return tickets.filter((t) => t.priority === "URGENT")
      case "assigned":
        return tickets.filter((t) => t.assignee)
      case "recent":
        return tickets.slice(0, 10).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      default:
        return tickets
    }
  }

  const tabs = [
    { id: "recent" as TabType, label: "Recentes", count: null },
    { id: "urgent" as TabType, label: "Urgentes", count: tickets.filter((t) => t.priority === "URGENT").length },
    { id: "assigned" as TabType, label: "Atribuídos", count: tickets.filter((t) => t.assignee).length },
    { id: "all" as TabType, label: "Todos", count: null },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Aberto
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Em Andamento
          </Badge>
        )
      case "RESOLVED":
      case "CLOSED":
        return (
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {status === "RESOLVED" ? "Resolvido" : "Fechado"}
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 dark:text-red-500"
      case "HIGH":
        return "text-orange-600 dark:text-orange-500"
      case "MEDIUM":
        return "text-yellow-600 dark:text-yellow-500"
      default:
        return "text-blue-600 dark:text-blue-500"
    }
  }

  const filteredTickets = getFilteredTickets().slice(0, 10) // Limitar a 10 itens

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm shrink-0",
                  activeTab === tab.id && "bg-primary text-primary-foreground"
                )}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Colunas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Personalizar Colunas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/admin/tickets/new")}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Chamado</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>

        {/* Table Header - Desktop */}
        <div className="hidden lg:grid grid-cols-[40px_40px_2fr_120px_100px_100px_120px_150px_40px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
          <div></div>
          <div></div>
          <div>Título</div>
          <div>Categoria</div>
          <div>Status</div>
          <div>Prioridade</div>
          <div>Unidade</div>
          <div>Responsável</div>
          <div></div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-sm text-muted-foreground">Nenhum chamado encontrado</p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={cn(
                  "group grid grid-cols-[40px_40px_1fr] lg:grid-cols-[40px_40px_2fr_120px_100px_100px_120px_150px_40px] gap-2 lg:gap-4 px-4 py-3 lg:py-4",
                  "hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0",
                  "items-center"
                )}
                onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
              >
                {/* Drag Handle - Desktop */}
                <div className="hidden lg:flex items-center">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                </div>
                
                {/* Checkbox */}
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedItems.has(ticket.id)}
                    onCheckedChange={(checked) => {
                      const newSelected = new Set(selectedItems)
                      if (checked) {
                        newSelected.add(ticket.id)
                      } else {
                        newSelected.delete(ticket.id)
                      }
                      setSelectedItems(newSelected)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {/* Título */}
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {ticket.title}
                  </div>
                  {/* Mobile: mostrar mais info */}
                  <div className="lg:hidden mt-1 flex items-center gap-2 flex-wrap">
                    {getStatusBadge(ticket.status)}
                    <span className={cn("text-xs font-medium", getPriorityColor(ticket.priority))}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{ticket.unit}</span>
                  </div>
                </div>
                
                {/* Categoria - Desktop */}
                <div className="hidden lg:flex items-center">
                  <span className="text-xs text-muted-foreground">{ticket.category}</span>
                </div>
                
                {/* Status - Desktop */}
                <div className="hidden lg:flex items-center">
                  {getStatusBadge(ticket.status)}
                </div>
                
                {/* Prioridade - Desktop */}
                <div className="hidden lg:flex items-center">
                  <span className={cn("text-xs font-medium", getPriorityColor(ticket.priority))}>
                    {ticket.priority}
                  </span>
                </div>
                
                {/* Unidade - Desktop */}
                <div className="hidden lg:flex items-center">
                  <span className="text-xs text-muted-foreground">{ticket.unit}</span>
                </div>
                
                {/* Responsável - Desktop */}
                <div className="hidden lg:flex items-center">
                  <span className="text-xs text-muted-foreground truncate">
                    {ticket.assignee?.name || "Não definido"}
                  </span>
                </div>
                
                {/* Menu - Desktop */}
                <div className="hidden lg:flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/tickets/${ticket.id}`)
                      }}>
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Menu - Mobile */}
                <div className="lg:hidden flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/tickets/${ticket.id}`)
                      }}>
                        Ver Detalhes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
