'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import NavMain from "./nav-main"
import { data } from "@/lib/constants"
import RecentOpen from "./recent-open"
import { TiAiAvatarIcon } from "../logo/TiAiAvatarIcon"


const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon" className="max-w-[212px] bg-background-90">
      <SidebarHeader className="pt-6 px-3 pb-0">
        <SidebarMenuButton size={"lg"} className="data-[state=open]:text-sidebar-accent-foreground">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <TiAiAvatarIcon className="h-full w-full" />
          </div>
          <span className="truncate  text-3xl font-semibold">TI</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="px-3 mt-10 gap-y-6">
        <NavMain items={data.navMain} />
        <RecentOpen recentProjects={data.recentProjects} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export default AppSidebar