import api from "@/lib/api";

export interface AiOutput {
  id: number;
  lectureId: number;
  outputType: string;
  outputContent: string;
  generatedAt?: string;
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
  getImportantPoints: async (lectureId: number): Promise<AiOutput> => {
    const res = await api.get(`/api/ai-output/lecture/${lectureId}/important-points`);
    return res.data;
  },
  queryDocMind: async (lectureId: number, question: string) => {
    const res = await api.post("/api/ai-output/query", { lectureId, question });
    return res.data;
  }
};
