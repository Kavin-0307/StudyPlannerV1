import api from "@/lib/api";
import { extractList } from "@/utils/apiNormalizer";

export const deadlineService = {
  getAll: async (page = 0, size = 10) => {
    const res = await api.get("/api/deadlines/all", { params: { page, size } });
    return extractList(res);
  },

  getUpcoming: async (page = 0, size = 10) => {
    const res = await api.get("/api/deadlines/upcoming", { params: { page, size } });
    return extractList(res);
  },

  getOverdue: async (page = 0, size = 10) => {
    const res = await api.get("/api/deadlines/overdue", { params: { page, size } });
    return extractList(res);
  },

  getFiltered: async (filters: any) => {
    const res = await api.get("/api/deadlines", { params: filters });
    return extractList(res);
  },

  create: async (subjectId: number, payload: any) => {
    const res = await api.post(`/api/deadlines?subjectId=${subjectId}`, payload);
    return res.data;
  },

  update: async (id: number, payload: any) => {
    const res = await api.put(`/api/deadlines/${id}`, payload);
    return res.data;
  },

  delete: async (id: number) => {
    return api.delete(`/api/deadlines/${id}`);
  },
};