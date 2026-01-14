import AppSidebar from "@/components/features/admin/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div>

      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
      </SidebarProvider>
    </div>
  );
}
