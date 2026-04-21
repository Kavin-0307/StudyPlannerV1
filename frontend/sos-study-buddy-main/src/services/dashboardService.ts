import api from "@/lib/api";

export interface DashboardData {
  totalSubjects: number;
  totalDeadlines: number;
  upcomingDeadlines: number;
  overdueDeadlines: number;
  totalRevisions: number;
  dueRevisions: number;
  totalStudySessions: number;
  completedSessions: number;
  todayPlan?: any[];
  upcomingDeadlinesList?: any[];
  dueRevisionsList?: any[];
}

export const dashboardService = {
  getData: async (userId: number): Promise<DashboardData> => {
    const res = await api.get(`/api/dashboard/${userId}`);
    return res.data;
  },
};
