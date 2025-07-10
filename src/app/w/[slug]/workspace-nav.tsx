"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface WorkspaceNavProps {
  workspaceSlug: string
}

export function WorkspaceNav({ workspaceSlug }: WorkspaceNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Dashboard",
      href: `/w/${workspaceSlug}`,
      icon: BarChart3,
      isActive: pathname === `/w/${workspaceSlug}`,
    },
    {
      label: "Miembros",
      href: `/w/${workspaceSlug}/members`,
      icon: Users,
      isActive: pathname === `/w/${workspaceSlug}/members`,
    },
    {
      label: "Configuración",
      href: `/w/${workspaceSlug}/settings`,
      icon: Settings,
      isActive: pathname === `/w/${workspaceSlug}/settings`,
    },
  ]

  return (
    <nav className="bg-white border rounded-lg p-4">
      <div className="flex space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.href}
              variant={item.isActive ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href={item.href} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}