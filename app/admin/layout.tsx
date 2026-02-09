import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import AppSidebar from "@/components/features/admin/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Se não logado, redireciona para login
  if (!user) {
    redirect("/login")
  }

  // Se não é admin, retorna 404 (não expõe a rota)
  if (user.role !== "ADMIN") {
    notFound()
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col h-full">
          <header className="flex h-16 md:hidden shrink-0 items-center justify-between border-b px-4">
            <Link href="/admin/dashboard" className="flex items-center">
              <Image
                src="/logo-horizontal.png"
                alt="AtivaDesk"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <SidebarTrigger className="-mr-1" />
          </header>
          <div className="flex-1 overflow-auto w-full h-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
