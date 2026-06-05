// src/services/revisionService.ts
import api from "@/lib/api";

export const revisionService = {
  getAll: async (params?: any) => {
    const res = await api.get("/api/revisions", { params });
    // Return the whole envelope (res.data) to keep totalPages and totalElements intact
    return res.data;
  },
  markComplete: async (id: number) => {
    const res = await api.patch(`/api/revisions/${id}/complete`);
    return res.data;
  }
};