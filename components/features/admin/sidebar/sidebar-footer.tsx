'use client'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { LogOut, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

type UserData = {
  id: string
  name: string
  email: string
  role: string
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const SidebarFooterContent = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()

        if (res.ok && data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (res.ok) {
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!user) {
    return (
      <div className="px-3 py-2">
        <div className="h-14 rounded-md bg-muted/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="px-3 py-3">
      {/* User Card with Integrated Actions */}
      <div className="group relative">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Avatar className="size-9 shrink-0 ring-2 ring-background">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-sm font-medium truncate w-full">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {user.email}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                toggleTheme()
              }}
              disabled={!mounted}
              className="h-7 w-7"
              title={mounted && theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {mounted && theme === "dark" ? (
                <Sun className="size-3.5" />
              ) : (
                <Moon className="size-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleLogout()
              }}
              disabled={loggingOut}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              title="Sair"
            >
              <LogOut className={cn("size-3.5", loggingOut && "animate-pulse")} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarFooterContent
