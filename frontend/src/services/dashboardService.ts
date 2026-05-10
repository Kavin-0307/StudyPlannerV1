import api from "@/lib/api";
import { authService } from "./authService";

export const dashboardService = {
  getDashboard: async () => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const res = await api.get(`/api/dashboard/${user.id}`);
    return res.data;
  },
};
