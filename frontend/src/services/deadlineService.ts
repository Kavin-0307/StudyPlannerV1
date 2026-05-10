import api from "@/lib/api";

export interface Deadline {
  id: number;
  deadlineTitle: string;
  deadlineType: "EXAM" | "ASSIGNMENT" | "TARGET";
  deadlineDate: string;
  deadlinePriority: number;
}

export const deadlineService = {
  getUpcoming: async () => {
    const res = await api.get("/api/deadlines/upcoming");
    return res.data.data;
  },
  getOverdue: async () => {
    const res = await api.get("/api/deadlines/overdue");
    return res.data.data;
  },
  getAll: async (params?: any) => {
    const res = await api.get("/api/deadlines", { params });
    return res.data.data;
  },
  create: async (subjectId: number, data: any) => {
    const res = await api.post(`/api/deadlines?subjectId=${subjectId}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/deadlines/${id}`);
  }
};
