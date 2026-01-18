'use client'
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
import { TiAiAvatarIcon } from "@/components/shared/logo/TiAiAvatarIcon"
import { Separator } from "@/components/ui/separator"
import SidebarFooterContent from "./sidebar-footer"
import { Notifications } from "./notifications"


const AppSidebar = () => {
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2">
          <SidebarMenuButton
            size={"lg"}
            className="
              h-auto 
              p-0 
              hover:bg-transparent 
              data-[state=open]:bg-transparent
              group
              flex-1
            "
          >
            <div className="flex items-center gap-2.5 w-full">
              <div className="flex flex-col items-start">
                <span className="text-base font-bold tracking-tight text-sidebar-foreground">AtivaDesk</span>
              </div>
            </div>
          </SidebarMenuButton>
          <Notifications />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2.5 py-3 gap-5">
        <NavMain items={data.navMain} />
        <Separator className="my-2 opacity-20" />
        <RecentOpen />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarFooterContent />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
