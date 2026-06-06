import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '@/services/subjectService'
import { lectureService } from '@/services/lectureService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, BookOpen, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/subjects/')({
  component: SubjectsPage,
})

const PRIORITY_LABEL: Record<number, { label: string; className: string }> = {
  1: { label: 'High priority',   className: 'text-red-600 bg-red-50 border-red-200' },
  2: { label: 'Medium priority', className: 'text-amber-700 bg-amber-50 border-amber-200' },
  3: { label: 'Low priority',    className: 'text-muted-foreground bg-muted border-border' },
}

function SubjectsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [subjectPriority, setSubjectPriority] = useState('1')
  const [subjectTag, setSubjectTag] = useState('EXAM')

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
  })

  // Fetch all lectures once to get per-subject counts — already cached from other pages
  const { data: lecturesEnvelope } = useQuery({
    queryKey: ['lectures', 'all', 0, 200, null, null],
    queryFn: () => lectureService.getAll({ size: 200 }),
  })

  const lectureCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    ;(lecturesEnvelope?.data || []).forEach((l: any) => {
      counts[l.subjectId] = (counts[l.subjectId] || 0) + 1
    })
    return counts
  }, [lecturesEnvelope])

  const createMutation = useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setOpen(false)
      setSubjectName('')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ subjectName, subjectPriority: Number(subjectPriority), subjectTag })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input id="name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={subjectPriority} onValueChange={setSubjectPriority}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Select value={subjectTag} onValueChange={setSubjectTag}>
                  <SelectTrigger><SelectValue placeholder="Select tag" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXAM">Exam</SelectItem>
                    <SelectItem value="PRACTICE">Practice</SelectItem>
                    <SelectItem value="REVISION">Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          Loading subjects...
        </div>
      ) : !subjects?.length ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No subjects yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((subject: any) => {
            const count = lectureCounts[subject.id] || 0
            const priority = PRIORITY_LABEL[subject.subjectPriority] || PRIORITY_LABEL[3]

            return (
              <Link key={subject.id} to="/subjects/$id" params={{ id: subject.id.toString() }}>
                <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full group">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {subject.subjectName}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{count} lecture{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${priority.className}`}>
                        {subject.subjectTag}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${priority.className}`}>
                        {priority.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}


