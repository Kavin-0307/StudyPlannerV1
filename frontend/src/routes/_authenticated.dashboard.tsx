import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { studyPlanService } from '@/services/studyPlanService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Library, BookOpen, Clock, CheckSquare } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: studyPlanService.getUserProgress,
  })

  if (dashLoading) {
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>
  }

  const chartData = progress ? Object.entries(progress).map(([name, value]) => ({ name, value })) : []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Top row: Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Subjects" value="--" icon={Library} />
        <StatCard title="Lectures" value={`${dashboard?.completedLectures || 0} processed`} icon={BookOpen} />
        <StatCard title="Pending Revisions" value="--" icon={CheckSquare} />
        <StatCard title="Overdue Deadlines" value={dashboard?.upcomingDeadlines?.length || 0} icon={Clock} className="text-destructive" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Middle row left: Today's Study Plan */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Today's Study Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.todayStudyPlan?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sessions scheduled for today.</p>
            ) : (
              <div className="space-y-4">
                {dashboard?.todayStudyPlan?.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div>
                      <p className="font-medium">{plan.subjectName || `Subject ${plan.subjectId}`}</p>
                      <p className="text-xs text-muted-foreground">{plan.durationMinutes} mins</p>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 rounded bg-background">
                      {plan.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Middle row right: Upcoming Deadlines */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.upcomingDeadlines?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-4">
                {dashboard?.upcomingDeadlines?.map((deadline: any) => (
                  <div key={deadline.id} className="flex flex-col gap-1 p-3 rounded-lg border border-border">
                    <p className="font-medium text-sm">{deadline.deadlineTitle}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{deadline.deadlineType}</span>
                      <span>{format(new Date(deadline.deadlineDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Study Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No progress data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, className }: { title: string; value: string | number; icon: any; className?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${className}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
