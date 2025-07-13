import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function LoadingPublicForm() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-3/4 mb-2" />
        <Skeleton className="h-6 w-full mb-1" />
        <Skeleton className="h-6 w-2/3 mb-4" />
        <div className="p-4 bg-muted/50 rounded-lg">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Progress indicator skeleton */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Form fields skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Submit button skeleton */}
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}