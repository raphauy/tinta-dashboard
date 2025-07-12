"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceAvatar } from "@/components/workspace-avatar"
import { cn } from "@/lib/utils"

interface WorkspaceImageUploadProps {
  workspace: {
    id: string
    name: string
    image?: string | null
  }
  onImageUploaded?: (imageUrl: string) => void
  onImageRemoved?: () => void
  className?: string
}

export function WorkspaceImageUpload({
  workspace,
  onImageUploaded,
  onImageRemoved,
  className
}: WorkspaceImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validaciones del lado cliente
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('La imagen no puede ser mayor a 2MB')
      return
    }

    // Mostrar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir archivo
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('workspaceId', workspace.id)

      const response = await fetch('/api/workspace/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const result = await response.json()
      toast.success('Imagen subida correctamente')
      onImageUploaded?.(result.url)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!workspace.image) return

    try {
      const response = await fetch('/api/workspace/remove-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: workspace.id,
          imageUrl: workspace.image
        }),
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la imagen')
      }

      toast.success('Imagen eliminada correctamente')
      setPreviewUrl(null)
      onImageRemoved?.()
    } catch (error) {
      console.error('Error removing image:', error)
      toast.error('Error al eliminar la imagen')
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const currentImageUrl = previewUrl || workspace.image
  const hasImage = Boolean(currentImageUrl)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-4">
        {/* Preview de la imagen */}
        <div className="relative">
          <WorkspaceAvatar 
            workspace={{
              name: workspace.name,
              image: currentImageUrl
            }}
            size="xl"
          />
          
          {hasImage && !isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Controles de upload */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>{hasImage ? 'Cambiar imagen' : 'Subir imagen'}</span>
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP. Máximo 2MB. Recomendado: 200x200px
          </p>
        </div>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}