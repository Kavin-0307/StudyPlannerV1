import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '@/services/subjectService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Folder } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/subjects/')({
  component: SubjectsPage,
})

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
        <div className="flex h-40 items-center justify-center">Loading subjects...</div>
      ) : subjects?.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No subjects found. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects?.map((subject: any) => (
            <Link key={subject.id} to="/subjects/$id" params={{ id: subject.id.toString() }}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{subject.subjectName}</CardTitle>
                  <Folder className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-accent text-accent-foreground">
                      {subject.subjectTag}
                    </span>
                    <span className="text-xs text-muted-foreground">Priority: {subject.subjectPriority}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
