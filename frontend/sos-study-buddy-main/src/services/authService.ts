import api from "@/lib/api";

export const authService = {
  login: async (data: { username: string; password: string }) => {
    try {
      const res = await api.post("/api/auth/login", data);

      console.log("✅ LOGIN SUCCESS - Token:", res.data.token);

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);
      console.log("💾 TOKEN SAVED TO LOCALSTORAGE");

      // ✅ FORCE RELOAD TO TRIGGER INTERCEPTOR
      setTimeout(() => {
        window.location.href = "/";
      }, 500);

      return res.data;
    } catch (error) {
      console.error("❌ LOGIN FAILED:", error);
      throw error;
    }
  },

  register: (data: { username: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),
};