import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { lectureService } from '@/services/lectureService'
import { subjectService } from '@/services/subjectService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Eye, ChevronLeft, ChevronRight, Calendar, BookmarkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/lectures/')({
  component: LecturesPage,
})

const STATUS_ORDER: Record<string, number> = { FAILED: 0, PROCESSING: 1, PENDING: 2, COMPLETED: 3 }

const SUBJECT_COLORS: string[] = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
]

function LecturesPage() {
  const [page, setPage] = React.useState(0)
  const [subjectFilter, setSubjectFilter] = React.useState<number | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const pageSize = 8

  const { data: lecturesEnvelope, isLoading: isLecturesLoading } = useQuery({
    queryKey: ['lectures', 'all', page, pageSize, subjectFilter, statusFilter],
    queryFn: () =>
      lectureService.getAll({
        page,
        size: pageSize,
        ...(subjectFilter ? { subjectId: subjectFilter } : {}),
        ...(statusFilter ? { processingStatus: statusFilter } : {}),
      }),
  })

  const { data: subjectsList, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
    retry: false,
  })

  // Build subject map + stable color assignment
  const { subjectsMap, subjectColorMap } = React.useMemo(() => {
    const nameMap: Record<number, string> = {}
    const colorMap: Record<number, string> = {}
    ;(subjectsList || []).forEach((sub: any, i: number) => {
      nameMap[sub.id] = sub.subjectName || sub.subject_name
      colorMap[sub.id] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]
    })
    return { subjectsMap: nameMap, subjectColorMap: colorMap }
  }, [subjectsList])

  const isLoading = isLecturesLoading || isSubjectsLoading
  const lectures = lecturesEnvelope?.data || []
  const totalPages = lecturesEnvelope?.totalPages || 1
  const totalElements = lecturesEnvelope?.totalElements

  // Reset to page 0 when filters change
  React.useEffect(() => { setPage(0) }, [subjectFilter, statusFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          All Lectures
          {totalElements !== undefined && (
            <span className="ml-3 text-lg font-normal text-muted-foreground">({totalElements})</span>
          )}
        </h1>
      </div>

      {/* Filter bar */}
      {!isLoading && (subjectsList?.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium mr-1">Subject:</span>
          <button
            onClick={() => setSubjectFilter(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              subjectFilter === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            All
          </button>
          {(subjectsList || []).map((sub: any) => (
            <button
              key={sub.id}
              onClick={() => setSubjectFilter(sub.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                subjectFilter === sub.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {sub.subjectName || sub.subject_name}
            </button>
          ))}

          <span className="text-xs text-muted-foreground font-medium ml-3 mr-1">Status:</span>
          {['COMPLETED', 'PENDING', 'PROCESSING', 'FAILED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading lectures...</div>
      ) : lectures.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No lectures found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lectures
              .slice()
              .sort((a: any, b: any) => a.id - b.id)
              .map((lec: any) => {
                const subjectName = subjectsMap[lec.subjectId] || `Subject ${lec.subjectId}`
                const subjectColor = subjectColorMap[lec.subjectId] || SUBJECT_COLORS[0]
                const formattedDate = lec.uploadDate
                  ? format(new Date(lec.uploadDate), 'MMM d, yyyy')
                  : 'No date'
                const isCompleted = lec.processingStatus === 'COMPLETED'
                const isFailed = lec.processingStatus === 'FAILED'

                return (
                  <Card
                    key={lec.id}
                    className="hover:border-primary/50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-bold tracking-tight leading-snug">
                            {lec.lectureTitle?.trim() ? lec.lectureTitle : `Lecture #${lec.id}`}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            {lec.lectureTitle?.trim() && (
                              <span className="mr-0.5 opacity-70">#{lec.id} •</span>
                            )}
                            <Calendar className="h-3 w-3" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                        {/* Bookmark — aria-labelled, toggleable visual */}
                        <button
                          aria-label={`Bookmark Lecture #${lec.id}`}
                          title="Save to bookmarks"
                          className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-primary"
                        >
                          <BookmarkIcon className="h-4 w-4" />
                        </button>
                      </CardHeader>

                      <CardContent className="mt-2">
                        {/* Subject chip with per-subject colour */}
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded border w-fit inline-block ${subjectColor}`}
                        >
                          {subjectName}
                        </span>
                      </CardContent>
                    </div>

                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center mb-3">
                        <Badge
                          variant={isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary'}
                        >
                          {lec.processingStatus || 'PENDING'}
                        </Badge>
                      </div>
                      {isCompleted && (
                        <Button asChild className="w-full" variant="outline">
                          <Link to="/lectures/$id" params={{ id: lec.id.toString() }}>
                            <Eye className="mr-2 h-4 w-4" /> View Analysis
                          </Link>
                        </Button>
                      )}
                      {isFailed && (
                        <p className="text-xs text-destructive text-center py-1">
                          Processing failed — try re-uploading
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>

          {/* Pagination */}
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
