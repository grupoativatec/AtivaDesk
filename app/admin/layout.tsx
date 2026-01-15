import AppSidebar from "@/components/features/admin/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col h-full">
          <header className="flex h-16 md:hidden shrink-0 items-center gap-2 border-b px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 overflow-auto w-full h-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
