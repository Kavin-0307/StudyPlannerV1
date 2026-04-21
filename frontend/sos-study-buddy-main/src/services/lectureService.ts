import api from "@/lib/api";
import { extractList } from "@/utils/apiNormalizer";

export interface Lecture {
  id: number;
  lectureTitle: string;
  fileName?: string;
  subjectName?: string;
  processed?: boolean;
  createdAt?: string;
}

export const lectureService = {
  upload: async (subjectId: number, file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);

    // ✅ IMPORTANT: backend expects "dto"
    formData.append(
      "dto",
      JSON.stringify({
        lectureTitle: title,
      })
    );

    const res = await api.post(`/api/lectures/${subjectId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  getAll: async (params?: any) => {
    const res = await api.get("/api/lectures", { params });
    return extractList(res); // ✅ always array
  },

  getById: async (id: number) => {
    const res = await api.get(`/api/lectures/${id}`);
    return res.data;
  },

  process: async (id: number) => {
    await api.post(`/api/lectures/${id}/process`);
  },

  delete: async (id: number) => {
    await api.delete(`/api/lectures/${id}`);
  },
};