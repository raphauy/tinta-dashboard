"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Download, Clock, CheckCircle, FileText } from "lucide-react"
import { type FormResponseWithRelations } from "@/services/form-response-service"
import { updateResponseStatusAction } from "./actions"
import { toast } from "sonner"

interface ResponsesListProps {
  responses: FormResponseWithRelations[]
  workspaceSlug: string
  formId: string
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

export function ResponsesList({ responses, workspaceSlug, formId }: ResponsesListProps) {
  const [loadingStatusChange, setLoadingStatusChange] = useState<string | null>(null)

  const handleStatusChange = async (responseId: string, newStatus: ResponseStatus) => {
    setLoadingStatusChange(responseId)
    
    try {
      const result = await updateResponseStatusAction(responseId, newStatus)
      
      if (result.success) {
        toast.success(`Estado actualizado a "${statusConfig[newStatus].label}"`)
      } else {
        toast.error(result.message || "Error al actualizar el estado")
      }
    } catch (error) {
      console.error("Error updating response status:", error)
      toast.error("Error al actualizar el estado")
    } finally {
      setLoadingStatusChange(null)
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha inválida'
    }
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin respuestas aún</CardTitle>
          <CardDescription>
            Este formulario no ha recibido respuestas todavía. Las respuestas aparecerán aquí cuando los clientes completen el formulario.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Todas las Respuestas ({responses.length})
        </CardTitle>
        <CardDescription>
          Gestiona y revisa todas las respuestas recibidas para este formulario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Campos</TableHead>
                <TableHead>Archivos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => {
                const StatusIcon = statusConfig[response.status as ResponseStatus]?.icon || Clock
                const statusStyle = statusConfig[response.status as ResponseStatus]?.color || "bg-gray-100 text-gray-800"
                const statusLabel = statusConfig[response.status as ResponseStatus]?.label || response.status

                return (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium" suppressHydrationWarning>
                      {formatDate(response.submittedAt)}
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={statusStyle}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(response.data as Record<string, unknown>).length} campos
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {response.files.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {response.files.length} archivo{response.files.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin archivos</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <Link href={`/w/${workspaceSlug}/forms/${formId}/responses/${response.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={loadingStatusChange === response.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {response.status !== "new" && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(response.id, "new")}
                                disabled={loadingStatusChange === response.id}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Marcar como Nueva
                              </DropdownMenuItem>
                            )}
                            
                            {response.status !== "reviewed" && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(response.id, "reviewed")}
                                disabled={loadingStatusChange === response.id}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Marcar como Revisada
                              </DropdownMenuItem>
                            )}
                            
                            {response.status !== "processed" && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(response.id, "processed")}
                                disabled={loadingStatusChange === response.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como Procesada
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}