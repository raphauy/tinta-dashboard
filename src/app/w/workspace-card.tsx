import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkspaceAvatar } from "@/components/workspace-avatar"
import { Workspace, WorkspaceRole } from "@prisma/client"
import { Users, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

interface WorkspaceCardProps {
  workspace: Workspace
  userRole: WorkspaceRole
  isSuperadmin?: boolean
}

export function WorkspaceCard({ workspace, userRole, isSuperadmin = false }: WorkspaceCardProps) {
  const getRoleBadge = (role: WorkspaceRole, isSuperadmin: boolean) => {
    if (isSuperadmin) {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100">
          <Shield className="w-3 h-3 mr-1" />
          Superadmin
        </Badge>
      )
    }
    
    return role === WorkspaceRole.admin ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100">
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">
        Miembro
      </Badge>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <WorkspaceAvatar 
              workspace={workspace}
              size="lg"
            />
            <div className="flex-1">
              <CardTitle className="text-lg">{workspace.name}</CardTitle>
              <div className="text-muted-foreground/60 text-sm mt-1">
                /{workspace.slug}
              </div>
            </div>
          </div>
          {getRoleBadge(userRole, isSuperadmin)}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        {workspace.description ? (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {workspace.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">
            Sin descripción
          </p>
        )}
        
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-3">
          <Users className="h-3 w-3" />
          <span>Workspace</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <Button asChild className="w-full">
          <Link href={`/w/${workspace.slug}`}>
            Acceder
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}