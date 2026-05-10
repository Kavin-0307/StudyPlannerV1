import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { deadlineService } from '@/services/deadlineService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/deadlines')({
  component: DeadlinesPage,
})

function DeadlinesPage() {
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['deadlines', 'all'],
    queryFn: () => deadlineService.getAll(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deadlines</h1>
          <p className="text-muted-foreground mt-1">Track upcoming exams and assignments.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading deadlines...</div>
      ) : deadlines?.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No deadlines found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deadlines?.map((d: any) => (
            <Card key={d.id} className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-bold">{d.deadlineTitle}</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{d.deadlineType}</Badge>
                  <Badge variant={d.deadlinePriority === 1 ? 'destructive' : 'secondary'}>
                    Priority {d.deadlinePriority}
                  </Badge>
                </div>
                <div className="text-sm font-medium">
                  Due: {format(new Date(d.deadlineDate), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
