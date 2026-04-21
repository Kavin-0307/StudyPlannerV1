import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { authService, type LoginRequest, type RegisterRequest } from "@/services/authService";

export interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sos_token");
    }
    return null;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sos_user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authService.login(data);
    const newToken = res.token;
    const newUser: User = {
      id: res.userId || 0,
      username: res.username || data.username,
      email: res.email || "",
    };
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("sos_token", newToken);
    localStorage.setItem("sos_user", JSON.stringify(newUser));
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sos_token");
    localStorage.removeItem("sos_user");
  }, []);

  const value: AuthState = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
