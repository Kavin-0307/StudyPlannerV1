import api from "@/lib/api";

export const dashboardService = {
  getDashboard: async () => {
    const res = await api.get("/api/dashboard");
    return res.data;
  },
};
