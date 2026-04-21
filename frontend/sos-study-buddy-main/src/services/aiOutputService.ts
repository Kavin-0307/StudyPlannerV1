import api from "@/lib/api";

export interface AiOutput {
  id: number;
  lectureId: number;
  type: string;
  content: string;
  createdAt?: string;
}

export const aiOutputService = {
  getAll: async (lectureId: number): Promise<AiOutput[]> => {
    const res = await api.get(`/api/ai-output/lecture/${lectureId}`);
    return res.data;
  },
  getSummary: async (lectureId: number): Promise<AiOutput> => {
    const res = await api.get(`/api/ai-output/lecture/${lectureId}/summary`);
    return res.data;
  },
  getKeywords: async (lectureId: number): Promise<AiOutput> => {
    const res = await api.get(`/api/ai-output/lecture/${lectureId}/keywords`);
    return res.data;
  },
  getRevisionSheet: async (lectureId: number): Promise<AiOutput> => {
    const res = await api.get(`/api/ai-output/lecture/${lectureId}/revision-sheet`);
    return res.data;
  },
};
