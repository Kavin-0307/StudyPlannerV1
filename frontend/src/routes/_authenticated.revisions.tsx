import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { revisionService } from '@/services/revisionService'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/revisions')({
  component: RevisionsPage,
})

function RevisionsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(0)
  const pageSize = 6

  const { data: revisionsEnvelope, isLoading } = useQuery({
    queryKey: ['revisions', 'all', page, pageSize],
    queryFn: () => revisionService.getAll({ page, size: pageSize }),
  })

  const completeMutation = useMutation({
    mutationFn: (id: number | string) => revisionService.markComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] })
    },
  })

  const revisions = revisionsEnvelope?.content || revisionsEnvelope?.data || []
  const totalPages = revisionsEnvelope?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spaced Revisions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review lectures systematically based on the forgetting curve memory models.
          </p>
        </div>
        {revisionsEnvelope?.totalElements !== undefined && (
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded border">
            Total Revisions: {revisionsEnvelope.totalElements}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading upcoming target reviews...</div>
      ) : revisions.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          Clear horizon. All items successfully reviewed!
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {revisions.map((rev: any) => {
              const itemUniqueId = rev.revisionId
              const rawDate = rev.revisionDate
              const lectureLabel = rev.lectureTitle || rev.lecture_title || `Lecture #${rev.lectureId}`
              const sessionIndex = rev.revisionNumber || 1
              const itemStatus = rev.status || 'PENDING'

              let formattedDate = 'No Date'
              if (rawDate) {
                try {
                  const [year, month, day] = rawDate.split('-').map(Number)
                  formattedDate = format(new Date(year, month - 1, day), 'MMM d, yyyy')
                } catch (e) {
                  formattedDate = 'Invalid Date'
                }
              }

              return (
                <Card 
                  key={itemUniqueId || Math.random()} 
                  className="hover:border-primary/40 transition-all flex flex-col justify-between p-4 space-y-4 shadow-sm bg-card text-card-foreground"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {lectureLabel}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interval Session</span>
                      <span className="text-sm font-semibold text-foreground/90">Revision #{sessionIndex}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 p-2 rounded border">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Target: <strong>{formattedDate}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <Badge variant={itemStatus === 'PENDING' ? 'secondary' : 'default'}>{itemStatus}</Badge>
                    {itemStatus !== 'COMPLETED' && itemUniqueId && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                        onClick={() => completeMutation.mutate(itemUniqueId)}
                        disabled={completeMutation.isPending}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Done
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 font-mono text-xs text-muted-foreground">
              <span>Page <strong>{page + 1}</strong> of {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setPage((old) => Math.max(0, old - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={page === 0} className="h-8 px-3 text-foreground">
                  <ChevronLeft className="h-4 w-4 mr-1" /> PREV
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setPage((old) => Math.min(totalPages - 1, old + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={page >= totalPages - 1} className="h-8 px-3 text-foreground">
                  NEXT <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}