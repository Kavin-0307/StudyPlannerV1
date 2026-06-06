import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lectureService } from '@/services/lectureService'
import { deadlineService } from '@/services/deadlineService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cpu, Eye, Upload, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/subjects/$id')({
  component: SubjectDetailsPage,
})

function SubjectDetailsPage() {
  const { id } = Route.useParams()
  const subjectId = Number(id)
  const queryClient = useQueryClient()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [lectureTitle, setLectureTitle] = useState('')
  const [uploadError, setUploadError] = useState('')

  const { data: lecturesEnvelope, isLoading: lecLoading } = useQuery({
    queryKey: ['lectures', subjectId],
    queryFn: () => lectureService.getAll({ subjectId, size: 100 }),
  })
  const lectures: any[] = lecturesEnvelope?.data || []

  const { data: deadlines, isLoading: deadLoading } = useQuery({
    queryKey: ['deadlines', subjectId],
    queryFn: () => deadlineService.getAll({ subjectId }),
  })

  const processMutation = useMutation({
    mutationFn: lectureService.process,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lectures', subjectId] }),
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) =>
      lectureService.upload(subjectId, file, {
        subjectId,
        filePath: file.name,
        lectureTitle: title.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', subjectId] })
      setUploadOpen(false)
      setSelectedFile(null)
      setLectureTitle('')
      setUploadError('')
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload lecture')
    },
  })

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    uploadMutation.mutate({ file: selectedFile, title: lectureTitle })
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedFile(null)
      setLectureTitle('')
      setUploadError('')
    }
    setUploadOpen(open)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subject Details</h1>
        <p className="text-muted-foreground mt-1">Manage lectures and deadlines for this subject.</p>
      </div>

      <Tabs defaultValue="lectures" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="lectures">
            Lectures {lectures.length > 0 && <span className="ml-1.5 text-xs opacity-60">({lectures.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
        </TabsList>

        {/* ── Lectures tab ── */}
        <TabsContent value="lectures" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lectures</h2>
            <Dialog open={uploadOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Upload className="mr-2 h-4 w-4" /> Upload Lecture
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Lecture PDF</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {uploadError && (
                    <p className="text-sm text-destructive font-medium text-center">{uploadError}</p>
                  )}

                  {/* Title field */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Lecture title
                      <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g. Week 3 — Newton's Laws"
                      value={lectureTitle}
                      onChange={(e) => setLectureTitle(e.target.value)}
                      maxLength={120}
                    />
                  </div>

                  {/* File picker */}
                  <div className="space-y-2">
                    <Label htmlFor="file">PDF file</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={uploadMutation.isPending || !selectedFile}>
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {lecLoading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              Loading lectures...
            </div>
          ) : lectures.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
              No lectures yet. Upload a PDF to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lectures
                .slice()
                .sort((a: any, b: any) => a.id - b.id)
                .map((lec: any) => {
                  const title = lec.lectureTitle?.trim()
                    ? lec.lectureTitle
                    : `Lecture #${lec.id}`
                  const subtitle = lec.lectureTitle?.trim()
                    ? `Lecture #${lec.id}`
                    : null
                  const formattedDate = lec.uploadDate
                    ? format(new Date(lec.uploadDate), 'MMM d, yyyy')
                    : null
                  const isCompleted = lec.processingStatus === 'COMPLETED'
                  const isProcessing = lec.processingStatus === 'PROCESSING'
                  const isFailed = lec.processingStatus === 'FAILED'

                  return (
                    <Card key={lec.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold leading-snug">{title}</CardTitle>
                        {subtitle && (
                          <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                        {formattedDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {formattedDate}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Badge
                          variant={
                            isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary'
                          }
                        >
                          {lec.processingStatus || 'PENDING'}
                        </Badge>
                        <div className="flex gap-2">
                          {!isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => processMutation.mutate(lec.id)}
                              disabled={processMutation.isPending || isProcessing}
                            >
                              <Cpu className="mr-1 h-4 w-4" />
                              {isProcessing ? 'Processing...' : 'Process'}
                            </Button>
                          )}
                          {isCompleted && (
                            <Button size="sm" asChild>
                              <Link to="/lectures/$id" params={{ id: lec.id.toString() }}>
                                <Eye className="mr-1 h-4 w-4" /> View AI
                              </Link>
                            </Button>
                          )}
                          {isFailed && (
                            <p className="text-xs text-destructive self-center">
                              Processing failed — retry
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>

        {/* ── Deadlines tab ── */}
        <TabsContent value="deadlines" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Deadlines</h2>
          {deadLoading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              Loading deadlines...
            </div>
          ) : !deadlines?.length ? (
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
              No deadlines found.
            </div>
          ) : (
            <div className="space-y-2">
              {deadlines.map((d: any) => (
                <div
                  key={d.id}
                  className="p-4 border rounded-lg flex justify-between items-center bg-card"
                >
                  <div>
                    <h3 className="font-semibold">{d.deadlineTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {d.deadlineType} • Due: {d.deadlineDate}
                    </p>
                  </div>
                  <Badge variant={d.deadlinePriority === 1 ? 'destructive' : 'secondary'}>
                    Priority {d.deadlinePriority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
