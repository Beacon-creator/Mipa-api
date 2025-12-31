"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../users/user.model");
const auth_utils_1 = require("./auth.utils");
const SALT_ROUNDS = 10;
class AuthService {
    static async signup(payload) {
        const existing = await user_model_1.User.findOne({ email: payload.email.toLowerCase() });
        if (existing) {
            throw new Error("Email already in use");
        }
        const passwordHash = await bcryptjs_1.default.hash(payload.password, SALT_ROUNDS);
        const code = (0, auth_utils_1.generate4DigitCode)();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        const user = await user_model_1.User.create({
            name: payload.name,
            email: payload.email.toLowerCase(),
            passwordHash,
            isEmailVerified: false,
            emailVerificationCode: code,
            emailVerificationCodeExpiresAt: expires,
        });
        const token = (0, auth_utils_1.signToken)(user._id.toString());
        return {
            user,
            token,
            needsEmailVerification: true,
            verificationCode: code,
        };
    }
    static async login(payload) {
        const user = await user_model_1.User.findOne({ email: payload.email.toLowerCase() });
        if (!user)
            throw new Error("Invalid credentials");
        const ok = await bcryptjs_1.default.compare(payload.password, user.passwordHash);
        if (!ok)
            throw new Error("Invalid credentials");
        const token = (0, auth_utils_1.signToken)(user._id.toString());
        return { user, token };
    }
    static async verifyEmail(payload) {
        const user = await user_model_1.User.findOne({ email: payload.email.toLowerCase() });
        if (!user)
            throw new Error("User not found");
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
        const token = (0, auth_utils_1.signToken)(user._id.toString());
        return { user, token };
    }
    static async requestPasswordReset(payload) {
        const user = await user_model_1.User.findOne({ email: payload.email.toLowerCase() });
        if (!user) {
            // Don't reveal existence, but keep API shape stable
            return { ok: true };
        }
        const token = (0, auth_utils_1.generate4DigitCode)(); // 4-digit reset code
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        user.resetPasswordToken = token;
        user.resetPasswordExpiresAt = expires;
        await user.save();
        return { ok: true, resetCode: token };
    }
    static async resetPassword(payload) {
        const user = await user_model_1.User.findOne({ email: payload.email.toLowerCase() });
        if (!user)
            throw new Error("User not found");
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
        user.passwordHash = await bcryptjs_1.default.hash(payload.newPassword, SALT_ROUNDS);
        user.resetPasswordToken = null;
        user.resetPasswordExpiresAt = null;
        await user.save();
    }
    static async resendVerification(payload) {
        const email = payload.email.toLowerCase();
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            return { ok: true }; // avoid revealing whether email exists
        }
        const code = (0, auth_utils_1.generate4DigitCode)();
        user.emailVerificationCode = code;
        user.emailVerificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();
        return { ok: true, verificationCode: code };
    }
    static async resendPasswordReset(payload) {
        const email = payload.email.toLowerCase();
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            return { ok: true };
        }
        const token = (0, auth_utils_1.generate4DigitCode)();
        user.resetPasswordToken = token;
        user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();
        // In production: send password reset email. Dev: return the code
        return { ok: true, resetCode: token };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map