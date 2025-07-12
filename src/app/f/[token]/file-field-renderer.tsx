'use client'

import { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, File, AlertCircle } from 'lucide-react'
import { type FormField } from '@/types/form-field'

interface FileFieldRendererProps {
  field: FormField
  value: File[]
  onChange: (value: File[]) => void
  error?: string
}

export function FileFieldRenderer({ field, value, onChange, error }: FileFieldRendererProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const files = value || []
  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/zip']

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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label htmlFor={field.id} className="text-base font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {field.helpText && (
            <p className="text-sm text-muted-foreground">
              {field.helpText}
            </p>
          )}

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : error 
                ? 'border-red-500 bg-red-50/50'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <Button 
                type="button"
                variant="outline"
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
            aria-required={field.required}
          />

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}