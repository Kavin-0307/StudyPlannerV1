import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { revisionService, type Revision } from "@/services/revisionService";
import type { PageResponse } from "@/services/subjectService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { PaginationControls } from "@/components/PaginationControls";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/revisions")({
  component: RevisionsPage,
});

function RevisionsPage() {
  const [tab, setTab] = useState("pending");
  const [revisions, setRevisions] = useState<PageResponse<Revision> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRevisions = async () => {
    setLoading(true);
    setError("");
    try {
      const status = tab === "all" ? undefined : tab.toUpperCase();
      const res = await revisionService.getAll({ status, page, size: 10 });
      setRevisions(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchRevisions();
  }, [tab]);

  useEffect(() => {
    fetchRevisions();
  }, [page]);

  const handleComplete = async (id: number) => {
    try {
      await revisionService.markComplete(id);
      fetchRevisions();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Revisions</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchRevisions} />
          ) : !revisions || revisions.content.length === 0 ? (
            <EmptyState
              title="No revisions"
              description="Revisions will appear after processing lectures"
              icon={<RotateCcw className="h-12 w-12 text-muted-foreground/50" />}
            />
          ) : (
            <>
              <div className="space-y-3">
                {revisions.content.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <p className="font-medium">{r.lectureTitle || `Revision #${r.revisionNumber}`}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Scheduled: {r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "N/A"}
                          </span>
                          {r.revisionNumber && (
                            <span className="text-xs text-muted-foreground">
                              Round {r.revisionNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.status || "pending"} />
                        {r.status?.toLowerCase() !== "completed" && (
                          <Button variant="outline" size="sm" onClick={() => handleComplete(r.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <PaginationControls page={page} totalPages={revisions.totalPages} onPageChange={setPage} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
