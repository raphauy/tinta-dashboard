import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserInWorkspace } from "@/services/workspace-service"
import { redirect, notFound } from "next/navigation"
import { WorkspaceNav } from "./workspace-nav"

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const session = await auth()
  const { slug } = await params
  
  if (!session?.user) {
    redirect("/login")
  }

  // Verificar que el workspace existe
  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    notFound()
  }

  // Verificar acceso al workspace (superadmins tienen acceso total)
  if (session.user.role !== "superadmin") {
    const hasAccess = await isUserInWorkspace(session.user.id, workspace.id)
    if (!hasAccess) {
      redirect("/w")
    }
  }

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-gray-600 mt-1">
                {workspace.description}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              /{workspace.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <WorkspaceNav workspaceSlug={slug} />

      {/* Content */}
      {children}
    </div>
  )
}