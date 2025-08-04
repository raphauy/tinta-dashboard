"use client"

import { useState } from "react"
import NextImage from 'next/image'
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
  ExternalLink,
  Image,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileDown,
  Loader
} from "lucide-react"
import { type ResponseWithForm } from "@/services/form-response-service"
import { updateResponseStatusAction, exportResponseToPDFAction } from "../actions"
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

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image
  if (fileType.includes('pdf')) return FileText
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet
  if (fileType.includes('word') || fileType.includes('document')) return FileText
  if (fileType.includes('zip') || fileType.includes('compressed')) return FileArchive
  if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('json')) return FileCode
  return FileText
}

const getFileColor = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'bg-purple-100 dark:bg-purple-900 text-purple-600'
  if (fileType.includes('pdf')) return 'bg-red-100 dark:bg-red-900 text-red-600'
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'bg-green-100 dark:bg-green-900 text-green-600'
  if (fileType.includes('word') || fileType.includes('document')) return 'bg-blue-100 dark:bg-blue-900 text-blue-600'
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600'
  return 'bg-gray-100 dark:bg-gray-900 text-gray-600'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [loadingStatusChange, setLoadingStatusChange] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [exportingPDF, setExportingPDF] = useState(false)

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

  const handleExportPDF = async () => {
    setExportingPDF(true)
    
    try {
      // Primero verificar permisos con el Server Action
      const authResult = await exportResponseToPDFAction(response.id)
      
      if (!authResult.success) {
        toast.error(authResult.message || "Error al verificar permisos")
        return
      }

      // Luego llamar al API route para generar el PDF
      const pdfResponse = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responseId: response.id }),
      })

      if (!pdfResponse.ok) {
        const error = await pdfResponse.json()
        toast.error(error.error || "Error al generar PDF")
        return
      }

      // Descargar el PDF
      const blob = await pdfResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Extraer el nombre del archivo del header Content-Disposition
      const contentDisposition = pdfResponse.headers.get('content-disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'respuesta.pdf'
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Error al exportar el PDF")
    } finally {
      setExportingPDF(false)
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
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={exportingPDF}
              >
                {exportingPDF ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </>
                )}
              </Button>
              
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
          {Object.entries(responseData).map(([fieldId, value], index) => {
            // Buscar archivos asociados a este campo
            const fieldFiles = response.files.filter(file => file.fieldName === fieldId)
            
            // Buscar el label del campo en el formulario
            const formFields = response.form.fields as Array<{ id: string; label: string; }>
            const field = formFields.find(f => f.id === fieldId)
            const fieldLabel = field?.label || fieldId
            
            return (
              <div key={fieldId}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Campo: {fieldLabel}
                    </h4>
                    {fieldFiles.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {fieldFiles.length} archivo{fieldFiles.length !== 1 ? 's' : ''} adjunto{fieldFiles.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Contenido del campo */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {typeof value === 'string' 
                        ? (value || '(sin valor)')
                        : JSON.stringify(value, null, 2)
                      }
                    </p>
                  </div>
                  
                  {/* Archivos adjuntos del campo */}
                  {fieldFiles.length > 0 && (
                    <div className="ml-4 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Archivos adjuntos:
                      </p>
                      <div className="space-y-2">
                        {fieldFiles.map((file) => {
                          const FileIcon = getFileIcon(file.fileType)
                          const fileColor = getFileColor(file.fileType)
                          
                          return (
                            <div 
                              key={file.id}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded flex items-center justify-center ${fileColor}`}>
                                  <FileIcon className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{file.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.fileSize)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFilePreview(file.fileUrl)}
                                  className="h-6 w-6 p-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileDownload(file.id, file.fileName)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {index < Object.entries(responseData).length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            )
          })}
          
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
              {response.files.map((file) => {
                const FileIcon = getFileIcon(file.fileType)
                const fileColor = getFileColor(file.fileType)
                const isImage = file.fileType.startsWith('image/')
                
                return (
                  <div 
                    key={file.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${fileColor}`}>
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{file.fileName}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Campo: {file.fieldName}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span>•</span>
                            <span>{file.fileType}</span>
                            <span>•</span>
                            <span suppressHydrationWarning>
                              {new Date(file.uploadedAt).toLocaleDateString('es-ES')}
                            </span>
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
                        {isImage ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewImage(file.fileUrl)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFilePreview(file.fileUrl)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isImage && previewImage === file.fileUrl && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="relative">
                          <NextImage 
                            src={file.fileUrl} 
                            alt={file.fileName}
                            className="max-w-full h-auto rounded-lg"
                            width={800}
                            height={400}
                            style={{ maxHeight: '400px', objectFit: 'contain' }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/80 dark:bg-black/80"
                            onClick={() => setPreviewImage(null)}
                          >
                            Cerrar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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
              <span>{response.form.title2 ? `${response.form.title} ${response.form.title2}` : response.form.title}</span>
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