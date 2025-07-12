'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, File, AlertCircle, Paperclip } from 'lucide-react'

interface AttachmentUploaderProps {
  fieldId: string
  fieldLabel: string
  value: File[]
  onChange: (value: File[]) => void
  error?: string
}

export function AttachmentUploader({ 
  fieldId, 
  value, 
  onChange, 
  error 
}: AttachmentUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const files = value || []
  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'image/jpeg', 
    'image/png', 
    'application/zip'
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      handleFiles(newFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    newFiles.forEach(file => {
      // Validar tamaño
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: Archivo muy grande (máximo 10MB)`)
        return
      }

      // Validar tipo
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      // En una implementación real, mostrarías estos errores
      console.warn('File validation errors:', errors)
    }

    if (validFiles.length > 0) {
      onChange([...files, ...validFiles])
      setIsExpanded(true) // Expandir automáticamente cuando se añaden archivos
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Si no está expandido, mostrar solo el botón rosa
  if (!isExpanded && files.length === 0) {
    return (
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200 hover:border-pink-300"
          onClick={() => setIsExpanded(true)}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Adjuntar archivos
        </Button>
        {error && (
          <div className="flex items-center space-x-2 text-red-500 mt-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    )
  }

  // Vista expandida con zona de carga y archivos
  return (
    <div className="mt-3 space-y-3">
      {/* Botón colapsable si hay archivos */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {files.length} archivo{files.length !== 1 ? 's' : ''} adjunto{files.length !== 1 ? 's' : ''}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      )}

      {/* Zona de carga expandida */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive 
                ? 'border-pink-400 bg-pink-50' 
                : error 
                ? 'border-red-500 bg-red-50/50'
                : 'border-pink-200 bg-pink-50/50 hover:border-pink-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-10 w-10 text-pink-400" />
            <div className="mt-3">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                className="bg-white hover:bg-pink-50 text-pink-600 border-pink-200"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar archivos
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                o arrastra archivos aquí
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              PDF, DOC, DOCX, JPG, PNG, ZIP (máximo 10MB por archivo)
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files))
              }
            }}
            className="hidden"
            id={`${fieldId}-attachments`}
          />

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}