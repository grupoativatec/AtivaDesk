"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Ticket, LogOut, Menu, X, Sun, Moon, ChevronDown, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  email: string
  role: string
}

export function TicketsNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()

      if (res.ok && data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (res.ok) {
        toast.success("Logout realizado com sucesso")
        router.push("/login")
      } else {
        throw new Error("Erro ao fazer logout")
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout")
    } finally {
      setLoggingOut(false)
    }
  }

  const navItems = [
    {
      label: "Meus Chamados",
      href: "/tickets",
      icon: Ticket,
      active: pathname === "/tickets" || pathname.startsWith("/tickets/"),
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getFirstName = (name: string) => {
    return name.split(" ")[0]
  }

  const [userMenuOpen, setUserMenuOpen] = useState(false)

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 dark:bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 dark:bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm dark:shadow-none">
      <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo e Navegação */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button
            onClick={() => router.push("/tickets")}
            className="flex items-center gap-2 group"
          >
            <div className="size-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
              <Ticket className="size-4.5 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">AtivaDesk</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "h-9 px-4 gap-2",
                    item.active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* User Menu e Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              {/* Theme Toggle - Desktop */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="size-9 hidden sm:flex"
                  title={theme === "dark" ? "Modo claro" : "Modo escuro"}
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              )}

              {/* User Menu - Desktop */}
              <div className="hidden md:flex items-center gap-2 relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {getFirstName(user.name)}
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-50 py-1">
                      <div className="px-3 py-2 border-b border-border/50">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      {mounted && (
                        <button
                          onClick={() => {
                            setTheme(theme === "dark" ? "light" : "dark")
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          {theme === "dark" ? (
                            <>
                              <Sun className="size-4" />
                              Modo claro
                            </>
                          ) : (
                            <>
                              <Moon className="size-4" />
                              Modo escuro
                            </>
                          )}
                        </button>
                      )}
                      <Separator className="my-1" />
                      <button
                        onClick={() => {
                          handleLogout()
                          setUserMenuOpen(false)
                        }}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="size-4" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden size-9"
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[280px] sm:w-[320px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-1">
            {/* Mobile Navigation */}
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    item.active && "bg-accent text-accent-foreground font-medium"
                  )}
                  onClick={() => {
                    router.push(item.href)
                    setMobileMenuOpen(false)
                  }}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>

          {/* Mobile User Section */}
          {user && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  {mounted && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11"
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark")
                        setMobileMenuOpen(false)
                      }}
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="size-4" />
                          Modo claro
                        </>
                      ) : (
                        <>
                          <Moon className="size-4" />
                          Modo escuro
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    disabled={loggingOut}
                  >
                    <LogOut className="size-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </nav>
  )
}
