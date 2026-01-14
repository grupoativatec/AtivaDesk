'use client'
import { useEffect, useState } from 'react'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
            case 'IN_PROGRESS':
                return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
            case 'RESOLVED':
                return 'bg-green-500/20 text-green-600 dark:text-green-400'
            case 'CLOSED':
                return 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
            default:
                return 'bg-muted/40'
        }
    }

    return (
        <SidebarGroup className="p-0">
            <SidebarGroupLabel>Chamados Recentes</SidebarGroupLabel>

            <SidebarMenu className="gap-1">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <SidebarMenuItem key={index}>
                            <Skeleton className="h-10 w-full rounded-md" />
                        </SidebarMenuItem>
                    ))
                ) : tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <SidebarMenuItem key={ticket.id}>
                            <SidebarMenuButton
                                asChild
                                tooltip={ticket.title}
                                className="
                                    h-auto
                                    rounded-md
                                    bg-muted/40
                                    px-3
                                    py-2
                                    text-xs
                                    justify-start
                                    transition-colors
                                    hover:bg-muted
                                    data-[active=true]:bg-muted
                                    flex flex-col items-start gap-1
                                "
                            >
                                <Link href={ticket.url} onClick={handleLinkClick} className="w-full">
                                    <span className="truncate w-full text-left">
                                        {ticket.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))
                ) : (
                    <SidebarMenuItem>
                        <div
                            className="
                                rounded-md
                                bg-muted/30
                                px-3
                                py-2
                                text-xs
                                text-muted-foreground
                            "
                        >
                            Nenhum chamado atribuído
                        </div>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}


export default RecentOpen;