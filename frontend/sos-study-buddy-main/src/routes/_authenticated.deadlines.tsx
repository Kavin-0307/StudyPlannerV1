import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { deadlineService, type Deadline } from "@/services/deadlineService";
import { subjectService, type Subject } from "@/services/subjectService";
import { mapDeadlinePayload } from "@/utils/mappers";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/deadlines")({
  component: DeadlinesPage,
});

function DeadlinesPage() {
  const [tab, setTab] = useState("all");
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState(1);
  const [type, setType] = useState("ASSIGNMENT");
  const [subjectId, setSubjectId] = useState<string>("");

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Deadline | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDeadlines = async () => {
    setLoading(true);
    setError("");
    try {
      let data: Deadline[] = [];

      if (tab === "upcoming") {
        data = await deadlineService.getUpcoming();
      } else if (tab === "overdue") {
        data = await deadlineService.getOverdue();
      } else {
        data = await deadlineService.getAll();
      }

      setDeadlines(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load deadlines");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data);
    } catch {}
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchDeadlines();
  }, [tab]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = mapDeadlinePayload({
        title,
        date: dueDate,
        type,
        priority,
      });

      await deadlineService.create(Number(subjectId), payload);

      setDialogOpen(false);
      resetForm();
      fetchDeadlines();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deadlineService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchDeadlines();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDueDate("");
    setPriority(1);
    setType("ASSIGNMENT");
    setSubjectId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Deadlines</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Deadline
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchDeadlines} />
          ) : deadlines.length === 0 ? (
            <EmptyState
              title="No deadlines"
              description="You're all caught up!"
              icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
            />
          ) : (
            <div className="space-y-3">
              {deadlines.map((d) => (
                <Card key={d.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{d.deadlineTitle}</p>
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(d.deadlineDate).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <StatusBadge status={d.deadlinePriority} />
                      <Button onClick={() => setDeleteTarget(d)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Deadline</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXAM">EXAM</SelectItem>
                <SelectItem value="ASSIGNMENT">ASSIGNMENT</SelectItem>
                <SelectItem value="TARGET">TARGET</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title || !subjectId}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Deadline"
        description={`Delete "${deleteTarget?.deadlineTitle}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}