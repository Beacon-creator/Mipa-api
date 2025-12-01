// src/modules/auth/auth.validators.ts
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),      // <- using z.email() as requested
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.email("Invalid email"),
  code: z.string().length(4, "Code must be 4 digits"),
});

export const requestPasswordResetSchema = z.object({
  email: z.email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email"),
  token: z.string().min(1),
  newPassword: z.string().min(6, "New password must be at least 6 chars"),
});

export type SignupSchema = z.infer<typeof signupSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type RequestPasswordResetSchema = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
