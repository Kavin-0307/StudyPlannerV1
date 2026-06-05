import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { revisionService } from '@/services/revisionService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Check } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/revisions')({
  component: RevisionsPage,
})

function RevisionsPage() {
  const queryClient = useQueryClient()

  // Do NOT pass userId — passing it causes a NullPointerException in Spring
  // when the primitive long getter tries to unbox a null Long field.
  // The service already filters by the authenticated user internally.
  const { data: revisionsData, isLoading, isError } = useQuery({
    queryKey: ['revisions'],
    queryFn: () => revisionService.getAll(),
    retry: false,
  })

  const completeMutation = useMutation({
    mutationFn: revisionService.markComplete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisions'] }),
  })

  const revisions = revisionsData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spaced Revisions</h1>
          <p className="text-muted-foreground mt-1">Review lectures based on the forgetting curve.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading revisions...</div>
      ) : isError ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          Could not load revisions. Process a lecture to generate a schedule.
        </div>
      ) : revisions.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No scheduled revisions found. Process lectures to generate a schedule.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {revisions.map((rev: any) => {
            const isCompleted = rev.status === 'COMPLETED'
            const isOverdue = rev.status === 'MISSED'

            return (
              <Card key={rev.revisionId} className={isCompleted ? 'opacity-60 bg-muted/50' : isOverdue ? 'border-destructive' : 'bg-card'}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Lecture {rev.lectureId}</CardTitle>
                  <CheckSquare className={`h-4 w-4 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="font-semibold text-muted-foreground">Revision #{rev.revisionNumber}</span>
                    <span>{format(new Date(rev.revisionDate), 'MMM d, yyyy')}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Badge variant={isCompleted ? 'secondary' : isOverdue ? 'destructive' : 'default'}>
                      {rev.status}
                    </Badge>

                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(rev.revisionId)}
                      >
                        <Check className="mr-1 h-3 w-3" /> Mark Done
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
