'use client'
import { useEffect, useState } from 'react'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
                    dot: 'bg-blue-400',
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-400'
                }
            case 'IN_PROGRESS':
                return {
                    dot: 'bg-yellow-400',
                    bg: 'bg-yellow-500/10',
                    text: 'text-yellow-400'
                }
            case 'RESOLVED':
                return {
                    dot: 'bg-green-400',
                    bg: 'bg-green-500/10',
                    text: 'text-green-400'
                }
            case 'CLOSED':
                return {
                    dot: 'bg-gray-400',
                    bg: 'bg-gray-500/10',
                    text: 'text-gray-400'
                }
            default:
                return {
                    dot: 'bg-sidebar-foreground/40',
                    bg: 'bg-sidebar-accent/40',
                    text: 'text-sidebar-foreground/60'
                }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -8 },
        visible: (index: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
            },
        }),
    }

    return (
        <SidebarGroup className="p-0">
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-2 mb-2">
                    Seus Chamados
                </SidebarGroupLabel>
            </motion.div>

            <SidebarMenu className="gap-1">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <SidebarMenuItem key={index}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/30" />
                            </motion.div>
                        </SidebarMenuItem>
                    ))
                ) : tickets.length > 0 ? (
                    tickets.map((ticket, index) => {
                        const statusConfig = getStatusConfig(ticket.status)

                        return (
                            <SidebarMenuItem key={ticket.id}>
                                <motion.div
                                    custom={index}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={ticket.title}
                                        className={cn(
                                            "h-auto rounded-md px-2.5 py-2",
                                            "bg-sidebar-accent/30 hover:bg-sidebar-accent",
                                            "transition-all duration-200",
                                            "group"
                                        )}
                                    >
                                        <Link href={ticket.url} onClick={handleLinkClick} className="w-full">
                                            <div className="flex items-start gap-2 w-full">
                                                <div className={cn(
                                                    "size-1.5 rounded-full mt-1.5 shrink-0",
                                                    statusConfig.dot
                                                )} />
                                                <span className={cn(
                                                    "text-xs leading-snug line-clamp-2 flex-1 text-left",
                                                    "text-sidebar-foreground/80 group-hover:text-sidebar-foreground transition-colors"
                                                )}>
                                                    {ticket.title}
                                                </span>
                                            </div>
                                        </Link>
                                    </SidebarMenuButton>
                                </motion.div>
                            </SidebarMenuItem>
                        )
                    })
                ) : (
                    <SidebarMenuItem>
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <div className="rounded-md bg-sidebar-accent/20 px-2.5 py-2 text-xs text-sidebar-foreground/60 text-center">
                                Nenhum chamado atribuído
                            </div>
                        </motion.div>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default RecentOpen;
