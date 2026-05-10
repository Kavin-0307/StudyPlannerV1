import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { lectureService } from '@/services/lectureService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/lectures/')({
  component: LecturesPage,
})

function LecturesPage() {
  const { data: lectures, isLoading } = useQuery({
    queryKey: ['lectures', 'all'],
    queryFn: () => lectureService.getAll(),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Lectures</h1>
      
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading lectures...</div>
      ) : lectures?.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-lg">
          No lectures found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lectures?.map((lec: any) => (
            <Card key={lec.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold truncate pr-4" title={lec.filePath.split('/').pop() || 'File'}>
                  {lec.filePath.split('/').pop() || 'File'}
                </CardTitle>
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
              </CardHeader>
              <CardContent className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={lec.processingStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                    {lec.processingStatus || 'PENDING'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Sub: {lec.subjectId}</span>
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
          ))}
        </div>
      )}
    </div>
  )
}
