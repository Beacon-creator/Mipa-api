// auth.controller.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "./auth.validators";
import { IUserDocument } from "../users/user.model";

function toUserDTO(user: IUserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
  };
}

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = signupSchema.parse(req.body);
      const result = await AuthService.signup(parsed);

      res.status(201).json({
        user: toUserDTO(result.user),
        token: result.token,
        needsEmailVerification: result.needsEmailVerification,
        // NEW: expose the verification code for the mobile app (dev only!)
        verificationCode: result.verificationCode,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.parse(req.body);
      const result = await AuthService.login(parsed);
      res.json({
        user: toUserDTO(result.user),
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = verifyEmailSchema.parse(req.body);
      const result = await AuthService.verifyEmail(parsed);
      res.json({
        user: toUserDTO(result.user),
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = requestPasswordResetSchema.parse(req.body);
      const result = await AuthService.requestPasswordReset(parsed);

      // result is { ok: true } or { ok: true, resetCode }
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = resetPasswordSchema.parse(req.body);
      await AuthService.resetPassword(parsed);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
  try {
    // Stateless logout: client should simply delete the token
    return res.json({ ok: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

}
