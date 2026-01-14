'use client'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

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
            <SidebarMenu>
                {items.map((item, index) => (
                    <SidebarMenuItem key={index}>
                        <SidebarMenuButton 
                            asChild 
                            tooltip={item.title} 
                            isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                            className={`text-lg ${pathname === item.url || pathname.startsWith(item.url + '/') ? 'bg-muted font-semibold' : ''}`}
                        >
                            <Link href={item.url} onClick={handleLinkClick}>
                                <item.icon className='text-lg' />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default NavMain