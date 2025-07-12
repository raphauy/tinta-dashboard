import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface WorkspaceAvatarProps {
  workspace: {
    name: string
    image?: string | null
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm', 
  xl: 'text-base'
}

export function WorkspaceAvatar({ 
  workspace, 
  size = 'md', 
  className 
}: WorkspaceAvatarProps) {
  const getWorkspaceInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {workspace.image && (
        <AvatarImage 
          src={workspace.image} 
          alt={workspace.name}
          className="object-cover"
        />
      )}
      <AvatarFallback className={cn(
        "font-medium bg-blue-100 text-blue-700",
        textSizeClasses[size]
      )}>
        {getWorkspaceInitials(workspace.name)}
      </AvatarFallback>
    </Avatar>
  )
}