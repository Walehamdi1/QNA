import type { ClientAnswerView } from "../types/dtos";
import { api } from "./api";

export type UpsertItem = { reponseClientId: number; commentaire: string };

const BASE = "/api/reponse-fournisseur";

export const FournisseurReviewService = {
  async list(formulaireId: number, clientUserId?: number): Promise<ClientAnswerView[]> {
    const params: Record<string, any> = {
      formulaireId,
      // cache-buster so dev tools don't return 304 and stale data
      _ts: Date.now(),
    };
    if (clientUserId != null) params.clientUserId = clientUserId;

    const { data } = await api.get<ClientAnswerView[]>(`${BASE}/reviews`, { params });
    return Array.isArray(data) ? data : [];
  },

  async upsertOne(payload: UpsertItem) {
    const { data } = await api.post(`${BASE}/upsert`, payload);
    return data;
  },

  async upsertBatch(items: UpsertItem[]) {
    // NOTE: controller path is /api/reponse-fournisseur/upsert-batch
    const { data } = await api.post(`${BASE}/upsert-batch`, { items });
    return data;
  },
};
