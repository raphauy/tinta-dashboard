"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, User, Trash2 } from "lucide-react"
import { updateUserRoleAction, deleteUserAction } from "@/app/admin/users/actions"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type User = {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "CLIENT"
  createdAt: Date
  updatedAt: Date
}

interface UserActionsClientProps {
  user: User
}

export function UserActionsClient({ user }: UserActionsClientProps) {
  const { data: session } = useSession()

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "CLIENT") => {
    try {
      const result = await updateUserRoleAction(userId, newRole)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error actualizando rol")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const result = await deleteUserAction(userId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error eliminando usuario")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Cambiar rol */}
        {user.role === "CLIENT" ? (
          <DropdownMenuItem
            onClick={() => handleRoleChange(user.id, "ADMIN")}
            disabled={session?.user?.id === user.id}
          >
            <Shield className="mr-2 h-4 w-4" />
            Hacer Admin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleRoleChange(user.id, "CLIENT")}
            disabled={session?.user?.id === user.id}
          >
            <User className="mr-2 h-4 w-4" />
            Hacer Cliente
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Eliminar usuario */}
        <DropdownMenuItem
          onClick={() => handleDeleteUser(user.id)}
          disabled={session?.user?.id === user.id}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}