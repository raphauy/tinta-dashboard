'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { type FormField } from '@/types/form-field'
import { Paperclip, X, AlertCircle } from 'lucide-react'
import { useRef, useState } from 'react'

interface PdfStyleFieldRendererProps {
  field: FormField
  value: string
  onChange: (value: string) => void
  error?: string
  attachments?: File[]
  onAttachmentsChange?: (files: File[]) => void
}

export function PdfStyleFieldRenderer({ 
  field, 
  value, 
  onChange, 
  error,
  attachments = [],
  onAttachmentsChange
}: PdfStyleFieldRendererProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (files: FileList) => {
    if (!onAttachmentsChange) return

    const newFiles = Array.from(files)
    const validFiles = newFiles.filter(file => {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'application/zip'
      ]
      
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return false
      }
      
      return allowedTypes.includes(file.type)
    })

    onAttachmentsChange([...attachments, ...validFiles])
  }

  const removeFile = (index: number) => {
    if (!onAttachmentsChange) return
    const newFiles = attachments.filter((_, i) => i !== index)
    onAttachmentsChange(newFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Help text como label principal */}
      {field.helpText && (
        <div className="text-stone-600 dark:text-gray-700 leading-relaxed">
          <span className="font-medium">
            {String(field.order).padStart(2, '0')}.
          </span>{" "}
          {field.helpText}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}

      {/* Input rectangular gris */}
      <div className="space-y-2">
        {field.type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`min-h-[120px] bg-tinta-verde-uva/10 dark:bg-gray-200 border border-stone-400 dark:border-gray-400 rounded-xl text-stone-700 dark:text-gray-800 placeholder:text-stone-400 dark:placeholder:text-gray-500 resize-none ${
              error ? 'border-red-400 bg-red-50 dark:bg-red-100' : ''
            }`}
            placeholder="Escribe tu respuesta aquí..."
          />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`bg-tinta-verde-uva/10 dark:bg-gray-200 border border-stone-400 dark:border-gray-400 rounded-xl text-stone-700 dark:text-gray-800 placeholder:text-stone-400 dark:placeholder:text-gray-500 h-12 ${
              error ? 'border-red-400 bg-red-50 dark:bg-red-100' : ''
            }`}
            placeholder="Escribe tu respuesta aquí..."
          />
        )}

        {/* Mostrar error si existe */}
        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Rectángulo rosa para adjuntos (si el campo lo permite) */}
      {field.allowAttachments && onAttachmentsChange && (
        <div className="space-y-3">
          <div
            className={`bg-tinta-rosa-vino rounded-xl p-4 transition-colors cursor-pointer ${
              dragOver ? 'bg-tinta-rosa-vino/90' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center justify-center gap-3">
              <Paperclip className="h-5 w-5 text-white" />
              <span className="text-white font-medium">
                Adjuntar archivos
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-500 dark:text-gray-600 text-center">
            PDF, Word, imágenes, ZIP • Máximo 10MB por archivo
          </p>

          {/* Input oculto para archivos */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* Lista de archivos adjuntos */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-stone-600 dark:text-gray-700">
                Archivos adjuntos ({attachments.length})
              </h4>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-stone-50 dark:bg-gray-100 rounded-md border border-stone-200 dark:border-gray-300"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Paperclip className="h-4 w-4 text-stone-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-700 dark:text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-gray-600">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-stone-400 hover:text-red-500 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}