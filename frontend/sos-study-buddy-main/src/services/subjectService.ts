import api from "@/lib/api";
import { extractList } from "@/utils/apiNormalizer";

export const subjectService = {
  getAll: async (params?: any) => {
    const res = await api.get("/api/subjects", { params });
    return extractList(res);
  },

  create: async (payload: any) => {
    const res = await api.post("/api/subjects", payload);
    return res.data;
  },

  update: async (id: number, payload: any) => {
    const res = await api.put(`/api/subjects/${id}`, payload);
    return res.data;
  },

  delete: async (id: number) => {
    return api.delete(`/api/subjects/${id}`);
  },
};
export interface Subject {
  id: number;
  subjectName: string;
  subjectPriority: number;
  subjectTag: string;
}