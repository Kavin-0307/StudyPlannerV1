import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("🔍 INTERCEPTOR - TOKEN:", token); // 👈 DEBUG LOG
  console.log("🔍 REQUEST URL:", config.url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ HEADER SET:", config.headers.Authorization);
  } else {
    console.warn("⚠️ NO TOKEN FOUND IN LOCALSTORAGE");
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;