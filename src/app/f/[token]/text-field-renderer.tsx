'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle } from 'lucide-react'
import { type FormField } from '@/types/form-field'

interface TextFieldRendererProps {
  field: FormField
  value: string
  onChange: (value: string) => void
  error?: string
}

export function TextFieldRenderer({ field, value, onChange, error }: TextFieldRendererProps) {
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
              <Input
                id={field.id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Ingresa ${field.label.toLowerCase()}`}
                className={error ? 'border-red-500 pr-10' : ''}
                aria-required={field.required}
              />
              
              {error && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-red-500 text-white">
                    <p>{error}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}