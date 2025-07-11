import { getAllUsers } from "@/services/user-service"
import { getAllWorkspaces } from "@/services/workspace-service"
import { getTemplates } from "@/services/template-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, workspaces, templates] = await Promise.all([
    getAllUsers(),
    getAllWorkspaces(),
    getTemplates()
  ])
  
  const userCount = users.length
  const workspaceCount = workspaces.length
  const templateCount = templates.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      workspaceCount={workspaceCount}
      templateCount={templateCount}
    >
      {children}
    </AdminSidebarClient>
  )
}