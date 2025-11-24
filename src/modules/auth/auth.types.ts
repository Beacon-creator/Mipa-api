export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type VerifyEmailInput = {
  email: string;
  code: string;
};

export type RequestPasswordResetInput = {
  email: string;
};

export type ResetPasswordInput = {
  email: string;
  token: string;
  newPassword: string;
};

export interface AuthPayload {
  userId: string;
  email: string;
  role?: string;
}
