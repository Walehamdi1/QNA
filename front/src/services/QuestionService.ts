import { api } from "./api";

export const QuestionService = {
  list: async () => (await api.get("/api/questions")).data,
  get: async (id: number) => (await api.get(`/api/questions/${id}`)).data,
  create: async (payload: any) => (await api.post(`/api/questions`, payload)).data,
  update: async (id: number, payload: any) => (await api.put(`/api/questions/${id}`, payload)).data,
  remove: async (id: number) => (await api.delete(`/api/questions/${id}`)).data,
  async search(params: { type?: string; q?: string; page?: number; size?: number }) {
    const { data } = await api.get("/api/questions/search", { params });
    return data;
  }
};
