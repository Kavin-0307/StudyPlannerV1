import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { subjectService, type Subject } from "@/services/subjectService";
import { mapSubjectPayload } from "@/utils/mappers";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/subjects")({
  component: SubjectsPage,
});

function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [name, setName] = useState("");
  const [priority, setPriority] = useState(1);
  const [tag, setTag] = useState("EXAM");

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await subjectService.getAll({
        page,
        keyword: searchQuery,
      });
      setSubjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [page, searchQuery]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapSubjectPayload({
        name,
        priority,
        tag,
      });

      if (editingSubject) {
        await subjectService.update(editingSubject.id, payload);
      } else {
        await subjectService.create(payload);
      }

      setDialogOpen(false);
      setEditingSubject(null);
      setName("");
      setPriority(1);
      setTag("EXAM");

      fetchSubjects();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await subjectService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchSubjects();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (s: Subject) => {
    setEditingSubject(s);
    setName(s.subjectName);
    setPriority(s.subjectPriority);
    setTag(s.subjectTag);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingSubject(null);
    setName("");
    setPriority(1);
    setTag("EXAM");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subjects</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Subject
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchSubjects} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects"
          description="Create your first subject to get started"
          icon={<BookOpen className="h-12 w-12 text-muted-foreground/50" />}
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Subject
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base">
                  {s.subjectName}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Priority: {s.subjectPriority} | Tag: {s.subjectTag}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "New Subject"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <select
                className="w-full border rounded px-2 py-1"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="EXAM">EXAM</option>
                <option value="PRACTICE">PRACTICE</option>
                <option value="REVISION">REVISION</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Subject"
        description={`Are you sure you want to delete "${deleteTarget?.subjectName}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}