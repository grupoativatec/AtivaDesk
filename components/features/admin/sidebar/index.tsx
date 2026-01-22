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
import { AtivaDeskLogo } from "@/components/shared/logo/AtivaDeskLogo"
import { motion } from "framer-motion"


const AppSidebar = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-5 border-b border-sidebar-border">
        <motion.div
          className="flex items-center justify-between gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
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
                <AtivaDeskLogo size="md" showText={true} animated={true} className="text-sidebar-foreground" />
              </div>
            </SidebarMenuButton>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Notifications />
          </motion.div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-2.5 py-3 gap-5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5"
        >
          <motion.div variants={itemVariants}>
            <NavMain items={data.navMain} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Separator className="my-2 opacity-20" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RecentOpen />
          </motion.div>
        </motion.div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <SidebarFooterContent />
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
