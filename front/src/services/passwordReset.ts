// src/services/passwordReset.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

export async function forgotPassword(email: string) {
  const { data } = await axios.post(`${API_BASE}/user/forgot-password`, { email });
  return data as { message: string };
}

export async function verifyResetCode(email: string, code: string) {
  const { data } = await axios.post(`${API_BASE}/user/forgot-password/verify`, { email, code });
  return data as { valid: boolean; error?: string };
}

export async function resetPassword(payload: {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const { data } = await axios.post(`${API_BASE}/user/forgot-password/reset`, payload);
  return data as { message?: string; error?: string };
}
