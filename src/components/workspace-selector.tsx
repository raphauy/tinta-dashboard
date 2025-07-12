"use client"

import { useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceAvatar } from "@/components/workspace-avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Workspace } from "@prisma/client"

interface WorkspaceSelectorProps {
  userWorkspaces: {
    workspace: Workspace
  }[]
}

export function WorkspaceSelector({
  userWorkspaces,
}: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Detectar workspace actual desde la URL
  const currentWorkspace = useMemo(() => {
    const workspaceSlugMatch = pathname.match(/^\/w\/([^\/]+)/)
    if (workspaceSlugMatch && workspaceSlugMatch[1] !== "profile" && workspaceSlugMatch[1] !== "settings") {
      const slug = workspaceSlugMatch[1]
      const found = userWorkspaces.find(item => item.workspace.slug === slug)
      if (found) {
        return {
          id: found.workspace.id,
          name: found.workspace.name,
          slug: found.workspace.slug,
          image: found.workspace.image
        }
      }
    }
    return null
  }, [pathname, userWorkspaces])


  const handleWorkspaceSelect = (workspaceSlug: string) => {
    setOpen(false)
    router.push(`/w/${workspaceSlug}`)
  }

  const handleCurrentWorkspaceClick = () => {
    if (currentWorkspace) {
      router.push(`/w/${currentWorkspace.slug}`)
    }
  }

  return (
    <div className="flex items-center">
      {/* Botón principal - navega al workspace actual */}
      <Button
        variant="ghost"
        onClick={handleCurrentWorkspaceClick}
        disabled={!currentWorkspace}
        className="flex items-center space-x-3 px-3 py-2 h-auto justify-start flex-1 hover:bg-muted/50"
      >
        {currentWorkspace ? (
          <>
            <WorkspaceAvatar 
              workspace={currentWorkspace}
              size="md"
            />
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm truncate max-w-[180px]">
                {currentWorkspace.name}
              </span>
              <span className="text-xs text-muted-foreground">
                /{currentWorkspace.slug}
              </span>
            </div>
          </>
        ) : (
          <>
            <WorkspaceAvatar 
              workspace={{ name: "Workspace", image: null }}
              size="md"
            />
            <span className="font-medium text-sm text-muted-foreground">
              Seleccionar workspace
            </span>
          </>
        )}
      </Button>

      {/* Separator visual */}
      <div className="w-px h-8 bg-border mx-1" />

      {/* Dropdown selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="w-auto px-2 hover:bg-muted/50"
          >
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar workspace..." />
            <CommandList>
              <CommandEmpty>No se encontraron workspaces.</CommandEmpty>
              <CommandGroup heading="Mis Workspaces">
                {userWorkspaces.map((item) => (
                  <CommandItem
                    key={item.workspace.id}
                    value={item.workspace.slug}
                    onSelect={() => handleWorkspaceSelect(item.workspace.slug)}
                    className="flex items-center space-x-3 px-3 py-2"
                  >
                    <WorkspaceAvatar 
                      workspace={item.workspace}
                      size="sm"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-sm">
                        {item.workspace.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{item.workspace.slug}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentWorkspace?.id === item.workspace.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}