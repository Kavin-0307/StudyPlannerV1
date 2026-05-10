import api from "@/lib/api";

export interface User {
  id: number;
  userName: string;
  userEmail: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const res = await api.post("/api/auth/login", credentials);
    return res.data;
  },
  register: async (data: any): Promise<AuthResponse> => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
