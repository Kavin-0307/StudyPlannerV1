import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { revisionService } from '@/services/revisionService'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { format, isToday, isBefore, startOfDay } from 'date-fns'

export const Route = createFileRoute('/_authenticated/revisions')({
  component: RevisionsPage,
})

// ─── Toast ─────────────────────────────────────────────────────────────────
type Toast = { id: number; message: string; onUndo: () => void }

function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const timerRef = React.useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const show = React.useCallback((message: string, onUndo: () => void) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, onUndo }])
    timerRef.current[id] = setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000,
    )
    return id
  }, [])

  const dismiss = React.useCallback((id: number) => {
    clearTimeout(timerRef.current[id])
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, show, dismiss }
}

// ─── Urgency helpers ───────────────────────────────────────────────────────
function parseRevisionDate(rawDate: string): Date {
  const [year, month, day] = rawDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

type UrgencyGroup = 'overdue' | 'today' | 'upcoming'

function getUrgency(rawDate: string): UrgencyGroup {
  const d = parseRevisionDate(rawDate)
  const today = startOfDay(new Date())
  if (isToday(d)) return 'today'
  if (isBefore(d, today)) return 'overdue'
  return 'upcoming'
}

const GROUP_META: Record<
  UrgencyGroup,
  { label: string; borderClass: string; badgeClass: string; badgeLabel: string }
> = {
  overdue: {
    label: 'Overdue',
    borderClass: 'border-l-4 border-l-red-400',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    badgeLabel: 'OVERDUE',
  },
  today: {
    label: 'Due Today',
    borderClass: 'border-l-4 border-l-amber-400',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeLabel: 'DUE TODAY',
  },
  upcoming: {
    label: 'Upcoming',
    borderClass: '',
    badgeClass: 'bg-secondary text-secondary-foreground',
    badgeLabel: 'PENDING',
  },
}

// ─── Single revision card ──────────────────────────────────────────────────
function RevisionCard({
  rev,
  group,
  onMarkDone,
  isCommitting,
}: {
  rev: any
  group: UrgencyGroup
  onMarkDone: (rev: any) => void
  isCommitting: boolean
}) {
  const meta = GROUP_META[group]
  const id = rev.revisionId
  const rawDate = rev.revisionDate
  const lectureLabel = rev.lectureTitle || `Lecture #${rev.lectureId}`
  const sessionIndex = rev.revisionNumber || 1

  let formattedDate = 'No date'
  if (rawDate) {
    try {
      formattedDate = format(parseRevisionDate(rawDate), 'MMM d, yyyy')
    } catch {
      formattedDate = 'Invalid date'
    }
  }

  return (
    <Card
      className={`flex flex-col justify-between p-4 space-y-4 transition-all ${meta.borderClass} ${
        isCommitting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {lectureLabel}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Interval Session
          </span>
          <span className="text-sm font-semibold text-foreground/90">Revision #{sessionIndex}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 p-2 rounded border">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>
            Target: <strong>{formattedDate}</strong>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 pt-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${meta.badgeClass}`}>
          {meta.badgeLabel}
        </span>
        {id && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
            onClick={() => onMarkDone(rev)}
            disabled={isCommitting}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Done
          </Button>
        )}
      </div>
    </Card>
  )
}

// ─── Group: Overdue — always fully visible, no pagination ─────────────────
function OverdueGroup({
  revisions,
  onMarkDone,
  committingIds,
}: {
  revisions: any[]
  onMarkDone: (rev: any) => void
  committingIds: Set<number>
}) {
  const [open, setOpen] = React.useState(true)

  return (
    <div className="space-y-3">
      <GroupHeader group="overdue" count={revisions.length} open={open} onToggle={() => setOpen((v) => !v)} />
      {open && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {revisions.map((rev) => (
            <RevisionCard
              key={rev.revisionId}
              rev={rev}
              group="overdue"
              onMarkDone={onMarkDone}
              isCommitting={committingIds.has(rev.revisionId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Group: Due Today — show 6, "Show all N" expand toggle ────────────────
const TODAY_INITIAL = 6

function TodayGroup({
  revisions,
  onMarkDone,
  committingIds,
}: {
  revisions: any[]
  onMarkDone: (rev: any) => void
  committingIds: Set<number>
}) {
  const [open, setOpen] = React.useState(true)
  const [expanded, setExpanded] = React.useState(false)

  const visible = expanded ? revisions : revisions.slice(0, TODAY_INITIAL)
  const hasMore = revisions.length > TODAY_INITIAL

  return (
    <div className="space-y-3">
      <GroupHeader group="today" count={revisions.length} open={open} onToggle={() => setOpen((v) => !v)} />
      {open && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((rev) => (
              <RevisionCard
                key={rev.revisionId}
                rev={rev}
                group="today"
                onMarkDone={onMarkDone}
                isCommitting={committingIds.has(rev.revisionId)}
              />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-medium text-primary hover:underline mt-1"
            >
              {expanded
                ? 'Show less'
                : `Show all ${revisions.length} due today`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Group: Upcoming — load more in batches of 6 ──────────────────────────
const UPCOMING_PAGE_SIZE = 6

function UpcomingGroup({
  revisions,
  onMarkDone,
  committingIds,
}: {
  revisions: any[]
  onMarkDone: (rev: any) => void
  committingIds: Set<number>
}) {
  const [open, setOpen] = React.useState(true)
  const [visibleCount, setVisibleCount] = React.useState(UPCOMING_PAGE_SIZE)

  const visible = revisions.slice(0, visibleCount)
  const hasMore = visibleCount < revisions.length
  const remaining = revisions.length - visibleCount

  return (
    <div className="space-y-3">
      <GroupHeader group="upcoming" count={revisions.length} open={open} onToggle={() => setOpen((v) => !v)} />
      {open && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((rev) => (
              <RevisionCard
                key={rev.revisionId}
                rev={rev}
                group="upcoming"
                onMarkDone={onMarkDone}
                isCommitting={committingIds.has(rev.revisionId)}
              />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((n) => n + UPCOMING_PAGE_SIZE)}
              className="w-full py-2.5 text-xs font-medium text-muted-foreground border border-dashed rounded-lg hover:border-primary/50 hover:text-primary transition-colors mt-1"
            >
              Load {Math.min(UPCOMING_PAGE_SIZE, remaining)} more
              <span className="ml-1 opacity-60">({remaining} remaining)</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Shared group header ───────────────────────────────────────────────────
function GroupHeader({
  group,
  count,
  open,
  onToggle,
}: {
  group: UrgencyGroup
  count: number
  open: boolean
  onToggle: () => void
}) {
  const meta = GROUP_META[group]
  return (
    <button onClick={onToggle} className="flex items-center gap-2 w-full text-left">
      <span className="text-sm font-semibold text-foreground">{meta.label}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
      {open ? (
        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
      )}
    </button>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
function RevisionsPage() {
  const queryClient = useQueryClient()
  const { toasts, show: showToast, dismiss } = useToast()

  const [committingIds, setCommittingIds] = React.useState<Set<number>>(new Set())
  const [optimisticDoneIds, setOptimisticDoneIds] = React.useState<Set<number>>(new Set())

  const { data: revisionsEnvelope, isLoading } = useQuery({
    queryKey: ['revisions', 'all'],
    queryFn: () => revisionService.getAll({ size: 200, revisionStatus: 'PENDING' }),
  })

  const completeMutation = useMutation({
    mutationFn: (id: number) => revisionService.markComplete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisions'] }),
    onError: (_err, id) => {
      setOptimisticDoneIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      setCommittingIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    },
  })

  const handleMarkDone = React.useCallback(
    (rev: any) => {
      const id: number = rev.revisionId
      setOptimisticDoneIds((prev) => new Set([...prev, id]))

      showToast(`Revision #${rev.revisionNumber} marked done`, () => {
        setOptimisticDoneIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      })

      setTimeout(() => {
        setOptimisticDoneIds((prev) => {
          if (!prev.has(id)) return prev
          setCommittingIds((c) => new Set([...c, id]))
          completeMutation.mutate(id)
          return prev
        })
      }, 5000)
    },
    [showToast, completeMutation],
  )

  const allRevisions: any[] = revisionsEnvelope?.content || revisionsEnvelope?.data || []

  const visibleRevisions = allRevisions.filter(
    (r) => r.status !== 'COMPLETED' && !optimisticDoneIds.has(r.revisionId),
  )

  const grouped = visibleRevisions.reduce(
    (acc: Record<UrgencyGroup, any[]>, rev) => {
      const g = rev.revisionDate ? getUrgency(rev.revisionDate) : 'upcoming'
      acc[g].push(rev)
      return acc
    },
    { overdue: [], today: [], upcoming: [] },
  )

  const totalVisible = visibleRevisions.length
  const totalElements = revisionsEnvelope?.totalElements ?? allRevisions.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spaced Revisions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review lectures systematically based on the forgetting curve memory model.
          </p>
        </div>
        {totalElements > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{totalVisible}</p>
            <p className="text-xs text-muted-foreground">pending of {totalElements}</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading revisions...</div>
      ) : totalVisible === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          All caught up — no pending revisions.
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.overdue.length > 0 && (
            <OverdueGroup
              revisions={grouped.overdue}
              onMarkDone={handleMarkDone}
              committingIds={committingIds}
            />
          )}
          {grouped.today.length > 0 && (
            <TodayGroup
              revisions={grouped.today}
              onMarkDone={handleMarkDone}
              committingIds={committingIds}
            />
          )}
          {grouped.upcoming.length > 0 && (
            <UpcomingGroup
              revisions={grouped.upcoming}
              onMarkDone={handleMarkDone}
              committingIds={committingIds}
            />
          )}
        </div>
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-4 bg-foreground text-background text-sm px-4 py-3 rounded-lg shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{t.message}</span>
            <button
              className="ml-2 text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100"
              onClick={() => { t.onUndo(); dismiss(t.id) }}
            >
              Undo
            </button>
            <button className="text-xs opacity-50 hover:opacity-80" onClick={() => dismiss(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
