import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, BookOpen, Clock, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const [chartPage, setChartPage] = React.useState(0)
  const chartPageSize = 4

  const { data: dashboardPayload, isLoading } = useQuery({
    queryKey: ['dashboard', 'data'],
    queryFn: () => dashboardService.getDashboard(),
  })

  // Mapped to your backend JSON response structure
  const processedLectures = dashboardPayload?.completedLectures || 0
  const pendingRevisions = dashboardPayload?.pendingLecturesCount || 0
  const overdueDeadlines = dashboardPayload?.upcomingDeadlines?.length || 0 

  // Mapping the metrics from the JSON response to the chart data format
  const rawChartItems = [
    { name: 'Total Study Sessions', value: dashboardPayload?.totalStudySessions || 0 },
    { name: 'Study Hours (Week)', value: dashboardPayload?.studyHoursThisWeek || 0 },
    { name: 'Completed Sessions', value: dashboardPayload?.completedStudySessions || 0 }
  ]
  
  const totalChartPages = Math.ceil(rawChartItems.length / chartPageSize) || 1

  const paginatedChartItems = React.useMemo(() => {
    const start = chartPage * chartPageSize
    return rawChartItems.slice(start, start + chartPageSize)
  }, [rawChartItems, chartPage, chartPageSize])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your academic progress.</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">Loading dashboard analytics...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Lectures</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{processedLectures} processed</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Pending Revisions</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{pendingRevisions}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-destructive">Upcoming Deadlines</CardTitle>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold text-destructive">{overdueDeadlines}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Metrics Framework</CardTitle>
              {totalChartPages > 1 && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-muted-foreground">Range {chartPage + 1} of {totalChartPages}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setChartPage((o) => Math.max(0, o - 1))} disabled={chartPage === 0}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setChartPage((o) => Math.min(totalChartPages - 1, o + 1))} disabled={chartPage >= totalChartPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-mono text-xs">
                {paginatedChartItems.map((item: any, idx: number) => {
                  const countValue = item.value || 0
                  const maxVal = Math.max(...rawChartItems.map((i: any) => i.value), 1)
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-muted-foreground px-1">
                        <span>{item.name.toLowerCase()}</span>
                        <span>{countValue} units</span>
                      </div>
                      <div className="h-8 w-full bg-muted/40 rounded border flex items-center relative overflow-hidden">
                        <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${Math.min(100, Math.max(8, (countValue / maxVal) * 100))}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}