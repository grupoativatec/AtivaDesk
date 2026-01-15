'use client'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

    return (
        <SidebarGroup className='p-0'>
            <SidebarMenu className="gap-1">
                {items.map((item, index) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                    
                    return (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton 
                                asChild 
                                tooltip={item.title} 
                                isActive={isActive}
                                className={cn(
                                    "h-10 rounded-md transition-all duration-200",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    isActive 
                                        ? "bg-accent text-accent-foreground font-semibold shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Link href={item.url} onClick={handleLinkClick} className="flex items-center gap-3 w-full">
                                    <item.icon className={cn(
                                        "size-5 shrink-0 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    <span className="text-sm">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default NavMain
