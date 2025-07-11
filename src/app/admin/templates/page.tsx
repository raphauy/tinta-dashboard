import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TemplatesList } from "./templates-list"
import { TemplatesTableSkeleton } from "./templates-table-skeleton"

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plantillas de Formularios</h1>
          <p className="text-muted-foreground">
            Gestiona las plantillas globales disponibles para todos los workspaces
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TemplatesTableSkeleton />}>
        <TemplatesList />
      </Suspense>
    </div>
  )
}