import type { AuthenticationRequest, AuthenticationResponse, ProfileResponse, RegisterRequest } from "../types/dtos";
import { api } from "./api";

const BASE = "/user";

export const AuthService = {
  async register(payload: RegisterRequest): Promise<{ message: string }> {
    const { data } = await api.post(`${BASE}/register`, payload);
    if ((data as any).error) throw new Error((data as any).error);
    return data;
  },

  async login(payload: AuthenticationRequest): Promise<AuthenticationResponse> {
    const { data } = await api.post(`${BASE}/auth`, payload);
    return data as AuthenticationResponse;
  },

  async profile(email: string): Promise<ProfileResponse> {
    const { data } = await api.get(`${BASE}/profile/${encodeURIComponent(email)}`);
    return data as ProfileResponse;
  },

  async updateProfile(profile: any): Promise<ProfileResponse> {
    const { data } = await api.put(`${BASE}/profile`, profile);
    return data as ProfileResponse;
  },

  async getAllUsers(): Promise<any[]> {
    const { data } = await api.get(`${BASE}/getAllUsers`);
    return data;
  },

  async getUserByEmail(email: string): Promise<any> {
    const { data } = await api.get(`${BASE}/${encodeURIComponent(email)}`);
    return data;
  },
  async setPassword(id: number, newPassword: string, confirmPassword: string) {
    const { data } = await api.put(`${BASE}/${id}/password`, {
      newPassword,
      confirmPassword,
    });
    return data as { message: string };
  },
};
