"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Clock, 
  CheckCircle, 
  Eye, 
  Download, 
  FileText, 
  Calendar,
  MoreHorizontal,
  ExternalLink
} from "lucide-react"
import { type ResponseWithForm } from "@/services/form-response-service"
import { updateResponseStatusAction } from "../actions"
import { toast } from "sonner"

interface ResponseViewerProps {
  response: ResponseWithForm
}

type ResponseStatus = "new" | "reviewed" | "processed"

const statusConfig = {
  new: {
    label: "Nueva",
    color: "bg-green-100 text-green-800",
    icon: Clock
  },
  reviewed: {
    label: "Revisada", 
    color: "bg-blue-100 text-blue-800",
    icon: Eye
  },
  processed: {
    label: "Procesada",
    color: "bg-purple-100 text-purple-800", 
    icon: CheckCircle
  }
} as const

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [loadingStatusChange, setLoadingStatusChange] = useState(false)

  const handleStatusChange = async (newStatus: ResponseStatus) => {
    setLoadingStatusChange(true)
    
    try {
      const result = await updateResponseStatusAction(response.id, newStatus)
      
      if (result.success) {
        toast.success(`Estado actualizado a "${statusConfig[newStatus].label}"`)
        // La página se recargará automáticamente debido a revalidatePath
      } else {
        toast.error(result.message || "Error al actualizar el estado")
      }
    } catch (error) {
      console.error("Error updating response status:", error)
      toast.error("Error al actualizar el estado")
    } finally {
      setLoadingStatusChange(false)
    }
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida'
      }
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha inválida'
    }
  }

  const handleFileDownload = (fileId: string, fileName: string) => {
    // Usar el endpoint seguro para descargar archivos
    const link = document.createElement('a')
    link.href = `/api/files/${fileId}`
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFilePreview = (fileUrl: string) => {
    // Para preview seguimos usando el URL directo
    window.open(fileUrl, '_blank')
  }

  const responseData = response.data as Record<string, unknown>
  const StatusIcon = statusConfig[response.status as ResponseStatus]?.icon || Clock
  const statusStyle = statusConfig[response.status as ResponseStatus]?.color || "bg-gray-100 text-gray-800"
  const statusLabel = statusConfig[response.status as ResponseStatus]?.label || response.status

  return (
    <div className="space-y-6">
      {/* Header de estado y acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className={statusStyle}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusLabel}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span suppressHydrationWarning>
                    {formatDate(response.submittedAt)}
                  </span>
                </div>
              </div>
              <CardDescription>
                {Object.keys(responseData).length} campos completados
                {response.files.length > 0 && ` • ${response.files.length} archivos adjuntos`}
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loadingStatusChange}>
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Cambiar Estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {response.status !== "new" && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange("new")}
                    disabled={loadingStatusChange}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Marcar como Nueva
                  </DropdownMenuItem>
                )}
                
                {response.status !== "reviewed" && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange("reviewed")}
                    disabled={loadingStatusChange}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Marcar como Revisada
                  </DropdownMenuItem>
                )}
                
                {response.status !== "processed" && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange("processed")}
                    disabled={loadingStatusChange}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Procesada
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>

      {/* Contenido de la respuesta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contenido de la Respuesta
          </CardTitle>
          <CardDescription>
            Todos los campos y valores enviados en esta respuesta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(responseData).map(([fieldId, value], index) => (
            <div key={fieldId}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Campo: {fieldId}
                  </h4>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {typeof value === 'string' 
                      ? (value || '(sin valor)')
                      : JSON.stringify(value, null, 2)
                    }
                  </p>
                </div>
              </div>
              {index < Object.entries(responseData).length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
          
          {Object.keys(responseData).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No se encontraron campos de texto en esta respuesta</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archivos adjuntos */}
      {response.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Archivos Adjuntos ({response.files.length})
            </CardTitle>
            <CardDescription>
              Archivos subidos junto con esta respuesta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {response.files.map((file) => (
                <div 
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{file.fileName}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Campo: {file.fieldName}</span>
                        <span>•</span>
                        <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{file.fileType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDownload(file.id, file.fileName)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilePreview(file.fileUrl)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>ID de Respuesta:</span>
              <span className="font-mono">{response.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Formulario:</span>
              <span>{response.form.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Workspace:</span>
              <span>{response.form.workspace.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Enviado:</span>
              <span suppressHydrationWarning>{formatDate(response.submittedAt)}</span>
            </div>
            {response.submitterIP && (
              <div className="flex justify-between">
                <span>IP de origen:</span>
                <span className="font-mono">{response.submitterIP}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}