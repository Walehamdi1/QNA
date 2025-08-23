import { api } from "./api";

export const UserService = {
  list: async () => (await api.get("/user")).data,
  create: async (payload: any) => (await api.post("/user", payload)).data,
  update: async (id: number, payload: any) => (await api.put(`/user/${id}`, payload)).data,
  remove: async (id: number) => (await api.delete(`/user/${id}`)).data,
  getById: async (id: number) => (await api.get(`/user/by-id/${id}`)).data,
  getByEmail: async (email: string) => (await api.get(`/user/by-email/${encodeURIComponent(email)}`)).data,
};
