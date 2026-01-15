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


const AppSidebar = () => {
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarHeader className="px-4 py-6 border-b border-border/50">
        <SidebarMenuButton
          size={"lg"}
          className="
            h-auto 
            p-0 
            hover:bg-transparent 
            data-[state=open]:bg-transparent
            group
          "
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary/15">
              <TiAiAvatarIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold tracking-tight">AtivaDesk</span>
              <span className="text-xs text-muted-foreground font-normal">Sistema</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 gap-6">
        <NavMain items={data.navMain} />
        <Separator className="my-2" />
        <RecentOpen />
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50">
        <SidebarFooterContent />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
