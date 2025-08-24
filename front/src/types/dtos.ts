export type Role = "ADMIN" | "CLIENT" | "FOURNISSEUR"; 

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token?: string;
  accessToken?: string;
  messageResponse?: string;
  role?: Role;
  email?: string;
  user?: any;
}
export interface ProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
export interface RegisterRequest {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  messageResponse: string;
  emailResponse: string;
}
export interface User {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
}
export type FormulaireListDTO = {
  id: number;
  titre: string;
  dateCreation: string;
  ownerEmail?: string | null;
};

export type QuestionDTO = {
  id: number;
  contenu: string;
  type?: string | null;
};

export type FormulaireDetailDTO = {
  id: number;
  titre: string;
  dateCreation: string;
  questions: QuestionDTO[];
};

export type ReponseClientDTO = {
  id: number;
  questionId: number;
  valeur: string;
  dateSoumission: string;
};

export type SubmissionDTO = {
  answers: { questionId: number; valeur: string }[];
};
export type ClientAnswerView = {
  reponseClientId: number;
  questionId: number | null;
  questionLabel: string | null;
  questionType: string | null;

  clientUserId: number | null;
  clientEmail: string | null;

  clientAnswer: string | null;
  submittedAt: string | null;

  fournisseurResponseId: number | null;
  fournisseurComment: string | null;
  fournisseurRespondedAt: string | null;
};