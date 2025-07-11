'use client'

import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CopyLinkButtonProps {
  url: string
  className?: string
}

export function CopyLinkButton({ url, className }: CopyLinkButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado al portapapeles')
    } catch {
      toast.error('Error al copiar enlace')
    }
  }

  return (
    <Button 
      variant="outline" 
      className={className}
      onClick={handleCopy}
    >
      <Link2 className="h-4 w-4 mr-2" />
      Copiar enlace
    </Button>
  )
}