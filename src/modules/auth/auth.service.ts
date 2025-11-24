import bcrypt from "bcryptjs";
import { User, IUserDocument } from "../users/user.model";
import {
  SignupInput,
  LoginInput,
  VerifyEmailInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from "./auth.types";
import { generate4DigitCode, signToken } from "./auth.utils";

const SALT_ROUNDS = 10;

export class AuthService {
  static async signup(payload: SignupInput) {
    const existing = await User.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      throw new Error("Email already in use");
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const code = generate4DigitCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      isEmailVerified: false,
      emailVerificationCode: code,
      emailVerificationCodeExpiresAt: expires,
    });

    // TODO: send verification email with 'code' here
    // await EmailService.sendVerificationCode(user.email, code);

    const token = signToken(user._id.toString());

    return { user, token, needsEmailVerification: true };
  }

  static async login(payload: LoginInput) {
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(payload.password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    const token = signToken(user._id.toString());
    return { user, token };
  }

  static async verifyEmail(payload: VerifyEmailInput) {
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) throw new Error("User not found");

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpiresAt) {
      throw new Error("No verification code on file");
    }

    const now = new Date();
    if (user.emailVerificationCodeExpiresAt < now) {
      throw new Error("Verification code expired");
    }

    if (user.emailVerificationCode !== payload.code) {
      throw new Error("Invalid verification code");
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpiresAt = null;
    await user.save();

    const token = signToken(user._id.toString());
    return { user, token };
  }

  static async requestPasswordReset(payload: RequestPasswordResetInput) {
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      // You can choose to not reveal that user doesn't exist
      return;
    }

    const token = generate4DigitCode(); // or a longer random token
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = expires;
    await user.save();

    // TODO: send password reset email with 'token'
    // await EmailService.sendPasswordReset(user.email, token);
  }

  static async resetPassword(payload: ResetPasswordInput) {
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) throw new Error("User not found");

    if (!user.resetPasswordToken || !user.resetPasswordExpiresAt) {
      throw new Error("No reset token on file");
    }

    const now = new Date();
    if (user.resetPasswordExpiresAt < now) {
      throw new Error("Reset token expired");
    }

    if (user.resetPasswordToken !== payload.token) {
      throw new Error("Invalid reset token");
    }

    user.passwordHash = await bcrypt.hash(payload.newPassword, SALT_ROUNDS);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();
  }
}
