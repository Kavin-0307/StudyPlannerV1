import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { lectureService } from '@/services/lectureService'
import { subjectService } from '@/services/subjectService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Eye, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/lectures/')({
  component: LecturesPage,
})

function LecturesPage() {
  const [page, setPage] = React.useState(0)
  const pageSize = 8

  // 1. Fetch paginated lectures envelope metadata block
  const { data: lecturesEnvelope, isLoading: isLecturesLoading } = useQuery({
    queryKey: ['lectures', 'all', page, pageSize],
    queryFn: () => lectureService.getAll({ page, size: pageSize }),
  })

  // 2. Fetch parallel subject lookup table collection list
  const { data: subjectsList, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
    retry: false,
  })

  // 3. Compile client-side subject map mapping table dictionary
  const subjectsMap = React.useMemo(() => {
    return (subjectsList || []).reduce((acc: Record<number, string>, sub: any) => {
      acc[sub.id] = sub.subjectName || sub.subject_name
      return acc
    }, {})
  }, [subjectsList])

  const isLoading = isLecturesLoading || isSubjectsLoading

  // Safely grab array elements list block and max page total allocations
  const lectures = lecturesEnvelope?.data || []
  const totalPages = lecturesEnvelope?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">All Lectures</h1>
        {lecturesEnvelope?.totalElements !== undefined && (
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded border">
            Total Records: {lecturesEnvelope.totalElements}
          </span>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading systems matrix...</div>
      ) : lectures.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No lectures found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Paginated Catalog Framework Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lectures.map((lec: any) => {
              const friendlySubjectName = subjectsMap[lec.subjectId] || `Subject ${lec.subjectId}`
              const formattedDate = lec.uploadDate ? format(new Date(lec.uploadDate), 'MMM d, yyyy') : 'No Date'

              return (
                <Card key={lec.id} className="hover:border-primary/50 transition-colors flex flex-col justify-between">
                  <div>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold tracking-tight">
                          Lecture #{lec.id}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Calendar className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                      <BookOpen className="h-4 w-4 text-primary shrink-0 mt-1" />
                    </CardHeader>
                    
                    <CardContent className="mt-2">
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="text-xs font-semibold text-foreground bg-secondary/60 px-2 py-1 rounded border w-fit">
                          {friendlySubjectName}
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant={lec.processingStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                        {lec.processingStatus || 'PENDING'}
                      </Badge>
                    </div>
                    {lec.processingStatus === 'COMPLETED' && (
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/lectures/$id" params={{ id: lec.id.toString() }}>
                          <Eye className="mr-2 h-4 w-4" /> View Analysis
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination Navigation Controller Interface Row */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 font-mono text-xs">
              <span className="text-muted-foreground">
                Page <strong>{page + 1}</strong> of {totalPages}
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((old) => Math.max(0, old - 1))}
                  disabled={page === 0}
                  className="h-8 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  PREV
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((old) => Math.min(totalPages - 1, old + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-8 px-3"
                >
                  NEXT
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}