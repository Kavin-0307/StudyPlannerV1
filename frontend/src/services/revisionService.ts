import api from "@/lib/api";

export const revisionService = {
  getAll: async (params?: any) => {
    const res = await api.get("/api/revisions", { params });
    return res.data.data;
  },
  markComplete: async (id: number) => {
    const res = await api.patch(`/api/revisions/${id}/complete`);
    return res.data;
  }
};
