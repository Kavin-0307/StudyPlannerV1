import api from "@/lib/api";

export interface Subject {
  id: number;
  subjectName: string;
  subjectPriority: number;
  subjectTag: string;
}

export const subjectService = {
  getAll: async (params?: any) => {
    const res = await api.get("/api/subjects", { params });
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post("/api/subjects", data);
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/subjects/${id}`);
  }
};
