"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, UserCog, Power, Trash2, Users } from "lucide-react"
import { UserRoleDialog } from "./UserRoleDialog"
import { UserStatusDialog } from "./UserStatusDialog"
import { UserDeleteDialog } from "./UserDeleteDialog"
import { UserTeamDialog } from "./UserTeamDialog"

interface User {
  id: string
  name: string
  email: string
  role: "USER" | "AGENT" | "ADMIN"
  deletedAt: string | null
  teamMemberships?: Array<{ team: { id: string; name: string } }>
}

interface UsersRowActionsProps {
  user: User
  onSuccess: () => void
}

export function UsersRowActions({ user, onSuccess }: UsersRowActionsProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)

  const isActive = !user.deletedAt

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            Mudar cargo
          </DropdownMenuItem>
          {user.role === "ADMIN" && (
            <DropdownMenuItem onClick={() => setTeamDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Atribuir a equipe
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
            <Power className="mr-2 h-4 w-4" />
            {isActive ? "Desativar" : "Ativar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        userId={user.id}
        userName={user.name}
        currentRole={user.role}
        onSuccess={onSuccess}
      />

      <UserStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        userId={user.id}
        userName={user.name}
        isActive={isActive}
        onSuccess={onSuccess}
      />

      <UserDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
        onSuccess={onSuccess}
      />

      <UserTeamDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        userId={user.id}
        userName={user.name}
        userRole={user.role}
        currentTeams={user.teamMemberships || []}
        onSuccess={onSuccess}
      />
    </>
  )
}
