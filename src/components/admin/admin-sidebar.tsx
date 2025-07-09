"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  Settings,
} from "lucide-react"

const adminNavItems = [
  {
    title: "Panel de Control",
    href: "/admin",
    icon: Home
  },
  {
    title: "Usuarios",
    href: "/admin/users", 
    icon: Users
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings
  }
]

interface AdminSidebarProps {
  children: React.ReactNode
}

export function AdminSidebar({ children }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Header with trigger and title like Claude */}
        <SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
          <h2 className="text-lg font-semibold truncate group-data-[collapsible=icon]:hidden">
            Admin
          </h2>
          <SidebarTrigger className="h-8 w-8 shrink-0" />
        </SidebarHeader>
        
        <SidebarContent>

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarRail />
      </Sidebar>
      
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}