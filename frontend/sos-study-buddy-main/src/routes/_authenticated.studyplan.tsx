import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { studyPlanService, type StudyPlan, type StudyProgress } from "@/services/studyPlanService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, CheckCircle, XCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/studyplan")({
  component: StudyPlanPage,
});

function StudyPlanPage() {
  const [tab, setTab] = useState("today");
  const [todayPlan, setTodayPlan] = useState<StudyPlan[]>([]);
  const [fullPlan, setFullPlan] = useState<StudyPlan[]>([]);
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [today, full, prog] = await Promise.all([
        studyPlanService.getToday(),
        studyPlanService.getFullPlan(),
        studyPlanService.getProgress(),
      ]);
      setTodayPlan(today);
      setFullPlan(full);
      setProgress(prog);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load study plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await studyPlanService.generate();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusUpdate = async (planId: number, status: string) => {
    try {
      await studyPlanService.updateStatus(planId, status);
      fetchData();
    } catch {}
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const renderSessionList = (sessions: StudyPlan[]) => {
    if (sessions.length === 0) {
      return <EmptyState title="No sessions" description="Generate a study plan to get started" />;
    }
    return (
      <div className="space-y-3">
        {sessions.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <p className="font-medium">{s.topic || s.subjectName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{s.date}</span>
                  {s.startTime && (
                    <span className="text-xs text-muted-foreground">
                      {s.startTime} - {s.endTime}
                    </span>
                  )}
                  {s.duration && (
                    <span className="text-xs text-muted-foreground">{s.duration}min</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={s.status || "pending"} />
                {s.status !== "completed" && s.status !== "missed" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStatusUpdate(s.id, "completed")}
                      title="Mark completed"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStatusUpdate(s.id, "missed")}
                      title="Mark missed"
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Study Plan</h1>
        <Button onClick={handleGenerate} disabled={generating}>
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? "Generating..." : "Generate Plan"}
        </Button>
      </div>

      {progress && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Sessions" value={progress.totalSessions} icon={CalendarDays} />
          <StatCard title="Completed" value={progress.completedSessions} icon={CheckCircle} />
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Completion Rate</p>
              <p className="text-2xl font-bold">{Math.round(progress.completionRate)}%</p>
              <Progress value={progress.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="full">Full Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          {renderSessionList(todayPlan)}
        </TabsContent>
        <TabsContent value="full" className="mt-4">
          {renderSessionList(fullPlan)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
