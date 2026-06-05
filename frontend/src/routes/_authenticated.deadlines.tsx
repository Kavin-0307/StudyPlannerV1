import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deadlineService } from '@/services/deadlineService'
import { subjectService } from '@/services/subjectService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/deadlines')({
  component: DeadlinesPage,
})

function DeadlinesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    deadlineTitle: '',
    deadlineDate: '',
    deadlineType: '',
    deadlinePriority: '3',
    subjectId: '',
  })

  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['deadlines', 'all'],
    queryFn: () => deadlineService.search(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      deadlineService.create(Number(form.subjectId), {
        deadlineTitle: form.deadlineTitle,
        // Backend expects LocalDateTime — append seconds so ISO string parses correctly
        deadlineDate: form.deadlineDate + ':00',
        deadlineType: form.deadlineType,
        deadlinePriority: Number(form.deadlinePriority),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] })
      setOpen(false)
      setForm({ deadlineTitle: '', deadlineDate: '', deadlineType: '', deadlinePriority: '3', subjectId: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deadlineService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deadlines'] }),
  })

  const canSubmit =
    form.deadlineTitle.trim() &&
    form.deadlineDate &&
    form.deadlineType &&
    form.subjectId &&
    !createMutation.isPending

  const priorityVariant = (p: number) => {
    if (p === 1) return 'destructive'
    if (p <= 2) return 'secondary'
    return 'outline'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deadlines</h1>
          <p className="text-muted-foreground mt-1">Track upcoming exams and assignments.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Deadline
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Deadline</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Module 3 Exam"
                  value={form.deadlineTitle}
                  onChange={(e) => setForm((f) => ({ ...f, deadlineTitle: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v }))}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.subjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={form.deadlineType}
                    onValueChange={(v) => setForm((f) => ({ ...f, deadlineType: v }))}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                      <SelectItem value="TARGET">Target</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority">Priority (1 = highest)</Label>
                  <Select
                    value={form.deadlinePriority}
                    onValueChange={(v) => setForm((f) => ({ ...f, deadlinePriority: v }))}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Due date &amp; time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={form.deadlineDate}
                  onChange={(e) => setForm((f) => ({ ...f, deadlineDate: e.target.value }))}
                />
              </div>

              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  Something went wrong. Check the date is in the future.
                </p>
              )}

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={!canSubmit}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? 'Saving...' : 'Create Deadline'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading deadlines...</div>
      ) : deadlines?.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No deadlines yet. Add one above.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deadlines?.map((d: any) => (
            <Card key={d.id} className="bg-card group relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-bold">{d.deadlineTitle}</CardTitle>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <button
                    onClick={() => deleteMutation.mutate(d.id)}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    aria-label="Delete deadline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{d.deadlineType}</Badge>
                  <Badge variant={priorityVariant(d.deadlinePriority)}>
                    Priority {d.deadlinePriority}
                  </Badge>
                </div>
                <div className="text-sm font-medium">
                  Due: {format(new Date(d.deadlineDate), 'MMM d, yyyy · h:mm a')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
