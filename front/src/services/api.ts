import axios from "axios";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// attach token from localStorage on each request
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
