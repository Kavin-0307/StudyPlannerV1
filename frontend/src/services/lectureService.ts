import api from "@/lib/api";

export interface Lecture {
  id: number;
  subjectId: number;
  filePath: string;
  processed: boolean;
  uploadDate: string;
  lectureText: string;
  indexed: boolean;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

export const lectureService = {
  getAll: async (params?: any) => {
    const res = await api.get("/api/lectures", { params });
    // Return the entire payload envelope containing metadata fields + item array data
    return res.data; 
  },
  getById: async (id: number) => {
    const res = await api.get(`/api/lectures/${id}`);
    return res.data;
  },
  upload: async (subjectId: number, file: File, dto: any) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));
    
    const res = await api.post(`/api/lectures/${subjectId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  process: async (id: number) => {
    const res = await api.post(`/api/lectures/${id}/process`);
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/lectures/${id}`);
  }
};