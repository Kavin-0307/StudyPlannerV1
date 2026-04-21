import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dashboardService, type DashboardData } from "@/services/dashboardService";
import { StatCard } from "@/components/StatCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { BookOpen, Clock, RotateCcw, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await dashboardService.getData(user.id);
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Subjects" value={data.totalSubjects} icon={BookOpen} />
        <StatCard title="Upcoming Deadlines" value={data.upcomingDeadlines} icon={Clock} />
        <StatCard title="Due Revisions" value={data.dueRevisions} icon={RotateCcw} />
        <StatCard
          title="Study Sessions"
          value={`${data.completedSessions}/${data.totalStudySessions}`}
          icon={CalendarDays}
          description="Completed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingDeadlinesList && data.upcomingDeadlinesList.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingDeadlinesList.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(d.dueDate).toLocaleDateString()}</p>
                    </div>
                    {d.priority && <StatusBadge status={d.priority} />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Study Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {data.todayPlan && data.todayPlan.length > 0 ? (
              <div className="space-y-3">
                {data.todayPlan.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{s.topic || s.subjectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.startTime} - {s.endTime}
                      </p>
                    </div>
                    <StatusBadge status={s.status || "pending"} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sessions today</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
