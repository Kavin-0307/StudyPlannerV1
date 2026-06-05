import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lectureService } from '@/services/lectureService'
import { deadlineService } from '@/services/deadlineService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cpu, Eye, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/subjects/$id')({
  component: SubjectDetailsPage,
})

function SubjectDetailsPage() {
  const { id } = Route.useParams()
  const subjectId = Number(id)
  const queryClient = useQueryClient()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')

  const { data: lectures, isLoading: lecLoading } = useQuery({
    queryKey: ['lectures', subjectId],
    queryFn: () => lectureService.getAll({ subjectId }),
  })

  const { data: deadlines, isLoading: deadLoading } = useQuery({
    queryKey: ['deadlines', subjectId],
    queryFn: () => deadlineService.getAll({ subjectId }),
  })

  const processMutation = useMutation({
    mutationFn: lectureService.process,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lectures', subjectId] }),
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) =>
      lectureService.upload(subjectId, file, { subjectId, filePath: file.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', subjectId] })
      setUploadOpen(false)
      setSelectedFile(null)
      setUploadError('')
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload lecture')
    }
  })

  const handleProcess = (lectureId: number) => {
    processMutation.mutate(lectureId)
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    uploadMutation.mutate({ file: selectedFile })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subject Details</h1>
          <p className="text-muted-foreground mt-1">Manage lectures and deadlines for this subject.</p>
        </div>
      </div>

      <Tabs defaultValue="lectures" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
        </TabsList>
        <TabsContent value="lectures" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lectures</h2>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
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
                  {uploadError && <div className="text-sm text-destructive font-medium text-center">{uploadError}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="file">Select PDF File</Label>
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
            <div>Loading lectures...</div>
          ) : lectures?.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">No lectures found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lectures?.map((lec: any) => (
                <Card key={lec.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base truncate">{lec.filePath.split('/').pop() || 'Lecture File'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={lec.processingStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                        {lec.processingStatus || 'PENDING'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {lec.processingStatus !== 'COMPLETED' && (
                        <Button size="sm" onClick={() => handleProcess(lec.id)} disabled={processMutation.isPending || lec.processingStatus === 'PROCESSING'}>
                          <Cpu className="mr-1 h-4 w-4" /> Process
                        </Button>
                      )}
                      {lec.processingStatus === 'COMPLETED' && (
                        <Button size="sm" asChild>
                          <Link to="/lectures/$id" params={{ id: lec.id.toString() }}>
                            <Eye className="mr-1 h-4 w-4" /> View AI
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="deadlines" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Deadlines</h2>
          {deadLoading ? (
            <div>Loading deadlines...</div>
          ) : deadlines?.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">No deadlines found.</div>
          ) : (
            <div className="space-y-2">
              {deadlines?.map((d: any) => (
                <div key={d.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                  <div>
                    <h3 className="font-semibold">{d.deadlineTitle}</h3>
                    <p className="text-sm text-muted-foreground">{d.deadlineType} • Due: {d.deadlineDate}</p>
                  </div>
                  <Badge variant={d.deadlinePriority === 1 ? 'destructive' : 'secondary'}>Priority {d.deadlinePriority}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
