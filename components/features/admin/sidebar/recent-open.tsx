'use client'
import { useEffect, useState } from 'react'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Ticket = {
    id: string
    title: string
    url: string
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
}

const RecentOpen = () => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const { setOpenMobile, isMobile } = useSidebar()

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    useEffect(() => {
        const fetchRecentTickets = async () => {
            try {
                const res = await fetch('/api/admin/tickets/recent', {
                    cache: 'no-store',
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.ok && data.tickets) {
                        setTickets(data.tickets)
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar tickets recentes:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecentTickets()

        // Atualizar a cada 30 segundos para manter os dados atualizados
        const interval = setInterval(fetchRecentTickets, 30000)

        return () => clearInterval(interval)
    }, [])

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN':
                return {
                    dot: 'bg-blue-500',
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-700 dark:text-blue-400'
                }
            case 'IN_PROGRESS':
                return {
                    dot: 'bg-yellow-500',
                    bg: 'bg-yellow-500/10',
                    text: 'text-yellow-700 dark:text-yellow-400'
                }
            case 'RESOLVED':
                return {
                    dot: 'bg-green-500',
                    bg: 'bg-green-500/10',
                    text: 'text-green-700 dark:text-green-400'
                }
            case 'CLOSED':
                return {
                    dot: 'bg-gray-500',
                    bg: 'bg-gray-500/10',
                    text: 'text-gray-700 dark:text-gray-400'
                }
            default:
                return {
                    dot: 'bg-muted',
                    bg: 'bg-muted/40',
                    text: 'text-muted-foreground'
                }
        }
    }

    return (
        <SidebarGroup className="p-0">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Chamados Recentes
            </SidebarGroupLabel>

            <SidebarMenu className="gap-1.5">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <SidebarMenuItem key={index}>
                            <Skeleton className="h-9 w-full rounded-md" />
                        </SidebarMenuItem>
                    ))
                ) : tickets.length > 0 ? (
                    tickets.map((ticket) => {
                        const statusConfig = getStatusConfig(ticket.status)
                        
                        return (
                            <SidebarMenuItem key={ticket.id}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={ticket.title}
                                    className={cn(
                                        "h-auto rounded-md px-3 py-2.5",
                                        "bg-muted/40 hover:bg-muted",
                                        "transition-all duration-200",
                                        "group"
                                    )}
                                >
                                    <Link href={ticket.url} onClick={handleLinkClick} className="w-full">
                                        <div className="flex items-start gap-2.5 w-full">
                                            <div className={cn(
                                                "size-2 rounded-full mt-1.5 shrink-0",
                                                statusConfig.dot
                                            )} />
                                            <span className={cn(
                                                "text-xs leading-snug line-clamp-2 flex-1 text-left",
                                                "group-hover:text-foreground transition-colors"
                                            )}>
                                                {ticket.title}
                                            </span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })
                ) : (
                    <SidebarMenuItem>
                        <div className="rounded-md bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground text-center">
                            Nenhum chamado atribuído
                        </div>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default RecentOpen;
