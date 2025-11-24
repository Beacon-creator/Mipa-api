import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserModel, IUser } from "../users/user.model";
import {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  RequestResetInput,
  ResetPasswordInput,
} from "./auth.validators";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export function signJwt(user: IUser) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function registerUser(input: RegisterInput) {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const emailVerificationCode = crypto.randomInt(1000, 9999).toString();

  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    emailVerificationCode,
  });

  // TODO: send emailVerificationCode to user.email
  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = signJwt(user);
  return { user, token };
}

export async function verifyEmail(input: VerifyEmailInput) {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) throw new Error("User not found");

  if (user.isEmailVerified) return user;

  if (user.emailVerificationCode !== input.code) {
    throw new Error("Invalid verification code");
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = null;
  await user.save();

  return user;
}

export async function requestPasswordReset(input: RequestResetInput) {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) return; // don't leak

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  user.resetPasswordToken = token;
  user.resetPasswordExpiresAt = expiresAt;
  await user.save();

  // TODO: send token link or code via email
  // e.g. https://mipa.com/reset-password?token=...
}

export async function resetPassword(input: ResetPasswordInput) {
  const user = await UserModel.findOne({
    resetPasswordToken: input.token,
    resetPasswordExpiresAt: { $gt: new Date() },
  });
  if (!user) throw new Error("Invalid or expired reset token");

  user.passwordHash = await bcrypt.hash(input.password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return user;
}
