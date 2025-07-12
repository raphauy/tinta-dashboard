'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle } from 'lucide-react'
import { type FormField } from '@/types/form-field'
import { AttachmentUploader } from './attachment-uploader'

interface TextareaFieldRendererProps {
  field: FormField
  value: string
  onChange: (value: string) => void
  error?: string
  attachments?: File[]
  onAttachmentsChange?: (files: File[]) => void
  attachmentError?: string
}

export function TextareaFieldRenderer({ 
  field, 
  value, 
  onChange, 
  error,
  attachments,
  onAttachmentsChange,
  attachmentError
}: TextareaFieldRendererProps) {
  const maxLength = 2000 // Límite razonable para textarea
  const currentLength = value.length

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-base font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {field.helpText && (
              <p className="text-sm text-muted-foreground">
                {field.helpText}
              </p>
            )}
            
            <div className="relative">
              <Textarea
                id={field.id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Describe ${field.label.toLowerCase()} en detalle...`}
                className={`min-h-[180px] ${error ? 'border-red-500 pr-10' : ''}`}
                rows={8}
                maxLength={maxLength}
                aria-required={field.required}
              />
              
              {error && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute right-3 top-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-red-500 text-white">
                    <p>{error}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              {error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <div />
              )}
              <p className="text-xs text-muted-foreground">
                {currentLength}/{maxLength} caracteres
              </p>
            </div>
            
            {/* Mostrar AttachmentUploader si el campo permite adjuntos */}
            {field.allowAttachments && onAttachmentsChange && (
              <AttachmentUploader
                fieldId={field.id}
                fieldLabel={field.label}
                value={attachments || []}
                onChange={onAttachmentsChange}
                error={attachmentError}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}