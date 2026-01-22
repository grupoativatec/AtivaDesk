'use client'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const NavMain = ({ items }: {
    items: {
        title: string,
        url: string,
        icon: React.FC<React.SVGProps<SVGSVGElement>>
        isActive?: boolean
        items?: {
            title: string,
            url: string,
        }[]
    }[]
}) => {
    const pathname = usePathname()
    const { setOpenMobile, isMobile } = useSidebar()

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false)
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
            },
        }),
    }

    return (
        <SidebarGroup className='p-0'>
            <SidebarMenu className="gap-1">
                {items.map((item, index) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                    
                    return (
                        <SidebarMenuItem key={index}>
                            <motion.div
                                custom={index}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <SidebarMenuButton 
                                    asChild 
                                    tooltip={item.title} 
                                    isActive={isActive}
                                    className={cn(
                                        "h-9 rounded-md transition-all duration-200 px-2.5",
                                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        isActive 
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                                    )}
                                >
                                    <Link href={item.url} onClick={handleLinkClick} className="flex items-center gap-3 w-full">
                                        <item.icon className={cn(
                                            "size-4 shrink-0 transition-colors",
                                            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                                        )} />
                                        <span className="text-sm font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </motion.div>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default NavMain
