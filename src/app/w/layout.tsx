import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { WorkspaceHeader } from "./workspace-header"

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // All authenticated users can access workspaces (including superadmins)

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkspaceHeader user={session.user} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}