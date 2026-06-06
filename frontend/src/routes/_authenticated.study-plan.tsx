import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studyPlanService } from '@/services/studyPlanService'
import { subjectService } from '@/services/subjectService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarIcon, RefreshCw, Wand2, ChevronDown, ChevronUp } from 'lucide-react'
import { format, isToday, isPast, startOfDay } from 'date-fns'

export const Route = createFileRoute('/_authenticated/study-plan')({
  component: StudyPlanPage,
})

// ─── Status badge colours ──────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  PLANNED: 'bg-secondary text-secondary-foreground',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  MISSED: 'bg-red-100 text-red-700 border-red-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
}

// ─── Single day section (collapsible for past days) ───────────────────────
function DaySection({
  dateStr,
  datePlans,
  subjectsMap,
  onStatusChange,
  isPending,
  hasPlan,
}: {
  dateStr: string
  datePlans: any[]
  subjectsMap: Record<number, string>
  onStatusChange: (id: number, status: string) => void
  isPending: boolean
  hasPlan: boolean
}) {
  const today = isToday(new Date(dateStr + 'T12:00:00'))
  const past = isPast(startOfDay(new Date(dateStr + 'T12:00:00'))) && !today

  // Collapse past days by default
  const [open, setOpen] = React.useState(!past)

  const allDone = datePlans.every((p) => p.status === 'COMPLETED' || p.status === 'MISSED')
  const totalMins = datePlans.reduce((s: number, p: any) => s + (p.durationMinutes || 0), 0)

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
        <h3 className="text-base font-semibold text-foreground/90">
          {format(new Date(dateStr + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
        </h3>
        {today && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
            Today
          </span>
        )}
        {allDone && !today && (
          <span className="ml-1 text-xs text-emerald-600 font-medium">✓ Done</span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{totalMins}m total</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-6 border-l-2 border-border/40">
          {datePlans.map((plan: any) => {
            const subjectName =
              subjectsMap[plan.subjectId] || plan.subjectName || `Subject ${plan.subjectId}`
            const statusStyle = STATUS_STYLES[plan.status] || STATUS_STYLES.PLANNED

            return (
              <Card
                key={plan.id}
                className={`transition-all ${
                  plan.status === 'COMPLETED' ? 'opacity-60 bg-muted/50' : 'bg-card'
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-start gap-2">
                    <span>{subjectName}</span>
                    <span className="text-sm font-normal text-muted-foreground shrink-0">
                      {plan.durationMinutes}m
                    </span>
                  </CardTitle>
                  {/* Status chip */}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border w-fit ${statusStyle}`}
                  >
                    {plan.status}
                  </span>
                </CardHeader>
                <CardContent>
                  <Select
                    value={plan.status}
                    onValueChange={(val) => onStatusChange(plan.id, val)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full h-8 text-xs mt-1">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="MISSED">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Regenerate confirmation modal ────────────────────────────────────────
function RegenerateModal({
  open,
  onConfirm,
  onCancel,
  isPending,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4 shadow-xl">
        <h2 className="text-base font-semibold">Regenerate study plan?</h2>
        <p className="text-sm text-muted-foreground">
          This will replace your current schedule with a new AI-generated plan based on your
          subjects and deadlines. Your completed sessions will not be affected.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Regenerating...
              </>
            ) : (
              'Regenerate'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
function StudyPlanPage() {
  const queryClient = useQueryClient()
  const [showRegenModal, setShowRegenModal] = React.useState(false)
  const todayRef = React.useRef<HTMLDivElement>(null)

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['study-plans'],
    queryFn: () => studyPlanService.getAll(),
  })

  const { data: subjectsList, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
    retry: false,
  })

  const subjectsMap = React.useMemo(
    () =>
      (subjectsList || []).reduce((acc: Record<number, string>, sub: any) => {
        acc[sub.id] = sub.subjectName || sub.subject_name
        return acc
      }, {}),
    [subjectsList],
  )

  const generateMutation = useMutation({
    mutationFn: studyPlanService.generate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-plans'] }),
  })

  const regenerateMutation = useMutation({
    mutationFn: studyPlanService.regenerate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] })
      setShowRegenModal(false)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      studyPlanService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-plans'] }),
  })

  const groupedPlans =
    (plans || []).reduce((acc: any, plan: any) => {
      const date = plan.studyDate
      if (!acc[date]) acc[date] = []
      acc[date].push(plan)
      return acc
    }, {}) || {}

  const sortedDates = Object.keys(groupedPlans).sort()
  const isLoading = isPlansLoading || isSubjectsLoading
  const hasPlan = sortedDates.length > 0

  // Scroll to today section on load
  React.useEffect(() => {
    if (!isLoading && hasPlan && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isLoading])

  // Summary stats
  const totalDays = sortedDates.length
  const completedDays = sortedDates.filter((d) =>
    groupedPlans[d].every((p: any) => p.status === 'COMPLETED' || p.status === 'MISSED'),
  ).length

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Plan</h1>
          <p className="text-muted-foreground mt-1">Your AI-generated optimal schedule.</p>
        </div>
        <div className="flex gap-2">
          {!hasPlan ? (
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {generateMutation.isPending ? 'Generating...' : 'Generate Plan'}
            </Button>
          ) : (
            <Button
              onClick={() => setShowRegenModal(true)}
              disabled={regenerateMutation.isPending}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Plan
            </Button>
          )}
        </div>
      </div>

      {/* Progress summary bar (only when plan exists) */}
      {hasPlan && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border text-sm">
          <span className="font-medium">{completedDays} / {totalDays} days done</span>
          <div className="flex-1 bg-border rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${totalDays > 0 ? (completedDays / totalDays) * 100 : 0}%` }}
            />
          </div>
          <span className="text-muted-foreground">
            {Math.round(totalDays > 0 ? (completedDays / totalDays) * 100 : 0)}%
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">Loading schedule...</div>
      ) : !hasPlan ? (
        <div className="p-12 text-center border border-dashed rounded-lg text-muted-foreground">
          No study plan yet. Click <strong>Generate Plan</strong> to create one based on your
          deadlines and subjects.
        </div>
      ) : (
        <div className="space-y-8 divide-y divide-border">
          {sortedDates.map((dateStr) => {
            const isT = isToday(new Date(dateStr + 'T12:00:00'))
            return (
              <div
                key={dateStr}
                ref={isT ? todayRef : undefined}
                className={`pt-6 first:pt-0 ${isT ? 'scroll-mt-8' : ''}`}
              >
                <DaySection
                  dateStr={dateStr}
                  datePlans={groupedPlans[dateStr]}
                  subjectsMap={subjectsMap}
                  onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                  isPending={updateStatusMutation.isPending}
                  hasPlan={hasPlan}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Regenerate confirmation modal */}
      <RegenerateModal
        open={showRegenModal}
        onConfirm={() => regenerateMutation.mutate()}
        onCancel={() => setShowRegenModal(false)}
        isPending={regenerateMutation.isPending}
      />
    </div>
  )
}
