import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studyPlanService } from '@/services/studyPlanService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarIcon, RefreshCw, Wand2 } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/study-plan')({
  component: StudyPlanPage,
})

function StudyPlanPage() {
  const queryClient = useQueryClient()

  const { data: plans, isLoading } = useQuery({
    queryKey: ['study-plans'],
    queryFn: () => studyPlanService.getAll(),
  })

  const generateMutation = useMutation({
    mutationFn: studyPlanService.generate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-plans'] }),
  })

  const regenerateMutation = useMutation({
    mutationFn: studyPlanService.regenerate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-plans'] }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => studyPlanService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-plans'] }),
  })

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status })
  }

  // Group by date
  const groupedPlans = plans?.content?.reduce((acc: any, plan: any) => {
    const date = plan.studyDate
    if (!acc[date]) acc[date] = []
    acc[date].push(plan)
    return acc
  }, {}) || {}

  const sortedDates = Object.keys(groupedPlans).sort()

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Plan</h1>
          <p className="text-muted-foreground mt-1">Your AI-generated optimal schedule.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="bg-primary hover:bg-primary/90">
            <Wand2 className="mr-2 h-4 w-4" /> {generateMutation.isPending ? 'Generating...' : 'Generate Plan'}
          </Button>
          <Button onClick={() => regenerateMutation.mutate()} disabled={regenerateMutation.isPending} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} /> 
            Regenerate
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">Loading schedule...</div>
      ) : sortedDates.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-lg text-muted-foreground">
          No study plan active. Click Generate Plan to create one based on your deadlines and subjects.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateStr) => {
            const datePlans = groupedPlans[dateStr]
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr
            
            return (
              <div key={dateStr} className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold border-b pb-2 text-foreground/90">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
                  {isToday && <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">Today</span>}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {datePlans.map((plan: any) => (
                    <Card key={plan.id} className={plan.status === 'COMPLETED' ? 'opacity-60 bg-muted/50' : 'bg-card'}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>{plan.subjectName || `Subject ${plan.subjectId}`}</span>
                          <span className="text-sm font-normal text-muted-foreground">{plan.durationMinutes}m</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select 
                          value={plan.status} 
                          onValueChange={(val) => handleStatusChange(plan.id, val)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-full h-8 text-xs mt-2">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLANNED">Planned</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="MISSED">Missed</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
