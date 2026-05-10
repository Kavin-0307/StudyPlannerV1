import api from "@/lib/api";

export interface StudyPlan {
  id: number;
  userId: number;
  subjectId: number;
  studyDate: string;
  durationMinutes: number;
  status: "PLANNED" | "COMPLETED" | "MISSED";
}

export const studyPlanService = {
  getToday: async (): Promise<StudyPlan[]> => {
    const res = await api.get("/api/studyplans/today");
    return res.data;
  },
  getUserProgress: async () => {
    const res = await api.get("/api/studyplans/user/progress");
    return res.data;
  },
  updateStatus: async (planId: number, status: string): Promise<StudyPlan> => {
    const res = await api.patch(`/api/studyplans/${planId}/status`, { status });
    return res.data;
  },
  generate: async (): Promise<StudyPlan[]> => {
    const res = await api.post("/api/studyplans/generate");
    return res.data;
  },
  regenerate: async (): Promise<StudyPlan[]> => {
    const res = await api.post("/api/studyplans/regenerate");
    return res.data;
  },
  getAll: async (params?: any) => {
    const res = await api.get("/api/studyplans", { params });
    return res.data.data;
  }
};
