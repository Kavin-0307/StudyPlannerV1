import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { lectureService, type Lecture } from "@/services/lectureService";
import { subjectService, type Subject } from "@/services/subjectService";
import { aiOutputService } from "@/services/aiOutputService";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Upload, FileText, Cpu, Trash2, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lectures")({
  component: LecturesPage,
});

function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [uploading, setUploading] = useState(false);

  // AI
  const [viewLecture, setViewLecture] = useState<Lecture | null>(null);
  const [aiOutputs, setAiOutputs] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Lecture | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Process
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchLectures = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await lectureService.getAll();
      setLectures(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load lectures");
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
    fetchLectures();
    fetchSubjects();
  }, []);

  const handleUpload = async () => {
    if (!file || !subjectId) return;

    setUploading(true);
    try {
      await lectureService.upload(Number(subjectId), file, title);

      setUploadOpen(false);
      setFile(null);
      setTitle("");
      setSubjectId("");

      fetchLectures();
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async (id: number) => {
    setProcessingId(id);
    try {
      await lectureService.process(id);
      fetchLectures();
    } catch {
      setError("Processing failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewAi = async (lecture: Lecture) => {
    setViewLecture(lecture);
    setAiLoading(true);
    try {
      const outputs = await aiOutputService.getAll(lecture.id);
      setAiOutputs(outputs);
    } catch {
      setAiOutputs([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await lectureService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchLectures();
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lectures</h1>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" /> Upload
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchLectures} />
      ) : lectures.length === 0 ? (
        <EmptyState
          title="No lectures"
          description="Upload your first lecture"
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lectures.map((l) => (
            <Card key={l.id}>
              <CardHeader>
                <CardTitle>{l.lectureTitle}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {l.subjectName} • {l.fileName}
                </p>

                <div className="flex gap-2 flex-wrap">
                  <StatusBadge status={l.processed ? "processed" : "pending"} />

                  {!l.processed && (
                    <Button
                      size="sm"
                      onClick={() => handleProcess(l.id)}
                      disabled={processingId === l.id}
                    >
                      <Cpu className="h-4 w-4 mr-1" />
                      {processingId === l.id ? "Processing..." : "Process"}
                    </Button>
                  )}

                  {l.processed && (
                    <Button size="sm" onClick={() => handleViewAi(l)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(l)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Lecture</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!file || !subjectId}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Lecture"
        description={`Delete "${deleteTarget?.lectureTitle}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}