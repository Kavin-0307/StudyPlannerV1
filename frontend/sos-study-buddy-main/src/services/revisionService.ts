import api from "@/lib/api";
import type { PageResponse } from "./subjectService";

export interface Revision {
  id: number;
  lectureId?: number;
  lectureTitle?: string;
  revisionNumber?: number;
  status?: string;
  scheduledDate?: string;
  completedDate?: string;
}

export interface RevisionFilters {
  status?: string;
  lectureId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const revisionService = {
  getAll: async (filters: RevisionFilters = {}): Promise<PageResponse<Revision>> => {
    const res = await api.get("/api/revisions", { params: filters });
    return res.data;
  },
  markComplete: async (id: number): Promise<Revision> => {
    const res = await api.patch(`/api/revisions/${id}/complete`);
    return res.data;
  },
};
