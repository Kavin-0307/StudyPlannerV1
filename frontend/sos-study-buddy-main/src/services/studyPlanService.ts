import api from "@/lib/api";
import type { PageResponse } from "./subjectService";

export interface StudyPlan {
  id: number;
  subjectName?: string;
  subjectId?: number;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status?: string;
  topic?: string;
  completed?: boolean;
  createdAt?: string;
}

export interface StudyProgress {
  totalSessions: number;
  completedSessions: number;
  missedSessions: number;
  completionRate: number;
}

export interface StudyPlanFilters {
  subjectId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const studyPlanService = {
  generate: async (): Promise<StudyPlan[]> => {
    const res = await api.post("/api/studyplans/generate");
    return res.data;
  },
  getToday: async (): Promise<StudyPlan[]> => {
    const res = await api.get("/api/studyplans/today");
    return res.data;
  },
  getFullPlan: async (): Promise<StudyPlan[]> => {
    const res = await api.get("/api/studyplans/user");
    return res.data;
  },
  getByRange: async (start: string, end: string): Promise<StudyPlan[]> => {
    const res = await api.get("/api/studyplans/range", { params: { start, end } });
    return res.data;
  },
  getProgress: async (): Promise<StudyProgress> => {
    const res = await api.get("/api/studyplans/user/progress");
    return res.data;
  },
  getFiltered: async (filters: StudyPlanFilters): Promise<PageResponse<StudyPlan>> => {
    const res = await api.get("/api/studyplans", { params: filters });
    return res.data;
  },
  updateStatus: async (planId: number, status: string): Promise<StudyPlan> => {
    const res = await api.patch(`/api/studyplans/${planId}/status`, null, { params: { status } });
    return res.data;
  },
};
