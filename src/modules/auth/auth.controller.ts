import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "./auth.validators";
import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from "./auth.service";

export async function registerHandler(req: Request, res: Response) {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);
    res.status(201).json({ id: user._id, email: user.email, name: user.name });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Unable to register" });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const input = loginSchema.parse(req.body);
    const { user, token } = await loginUser(input);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Unable to login" });
  }
}

export async function verifyEmailHandler(req: Request, res: Response) {
  try {
    const input = verifyEmailSchema.parse(req.body);
    const user = await verifyEmail(input);
    res.json({ message: "Email verified", isEmailVerified: user.isEmailVerified });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Unable to verify email" });
  }
}

export async function requestResetHandler(req: Request, res: Response) {
  try {
    const input = requestResetSchema.parse(req.body);
    await requestPasswordReset(input);
    res.json({ message: "If that email exists, a reset link was sent." });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Unable to request reset" });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const input = resetPasswordSchema.parse(req.body);
    await resetPassword(input);
    res.json({ message: "Password reset successful" });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Unable to reset password" });
  }
}
