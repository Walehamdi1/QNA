import type { ReponseClientDTO, SubmissionDTO } from "../types/dtos";
import { api } from "./api";

export const FormulaireService = {
  list: async () => (await api.get("/api/formulaires")).data,
  get: async (id: number) => (await api.get(`/api/formulaires/${id}`)).data,
  create: async (userId: number, payload: any) =>
    (await api.post(`/api/formulaires/user/${userId}`, payload)).data,
  update: async (id: number, payload: any) => (await api.put(`/api/formulaires/${id}`, payload)).data,
  remove: async (id: number) => (await api.delete(`/api/formulaires/${id}`)).data,
  async getQuestions(formulaireId: number) {
    const { data } = await api.get(`/api/formulaires/${formulaireId}/questions`);
    // Expect an array of Question (or just ids; we’ll handle both)
    return data;
  },
  async setQuestions(formulaireId: number, questionIds: number[]) {
    const { data } = await api.put(`/api/formulaires/${formulaireId}/questions`, {
      questionIds,
    });
    return data;
  },
  submit: async (formulaireId: number, payload: SubmissionDTO) =>
    (await api.post(`/api/formulaires/${formulaireId}/submit`, payload)).data as ReponseClientDTO[],
  myResponses: async (formulaireId: number) =>
    (await api.get(`/api/formulaires/${formulaireId}/responses/me`)).data as ReponseClientDTO[],
};
