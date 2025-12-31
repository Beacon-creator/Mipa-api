"use strict";
// auth.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validators_1 = require("./auth.validators");
function toUserDTO(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
    };
}
class AuthController {
    static async signup(req, res, next) {
        try {
            const parsed = auth_validators_1.signupSchema.parse(req.body);
            const result = await auth_service_1.AuthService.signup(parsed);
            res.status(201).json({
                user: toUserDTO(result.user),
                token: result.token,
                needsEmailVerification: result.needsEmailVerification,
                // NEW: expose the verification code for the mobile app (dev only!)
                verificationCode: result.verificationCode,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async login(req, res, next) {
        try {
            const parsed = auth_validators_1.loginSchema.parse(req.body);
            const result = await auth_service_1.AuthService.login(parsed);
            res.json({
                user: toUserDTO(result.user),
                token: result.token,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async verifyEmail(req, res, next) {
        try {
            const parsed = auth_validators_1.verifyEmailSchema.parse(req.body);
            const result = await auth_service_1.AuthService.verifyEmail(parsed);
            res.json({
                user: toUserDTO(result.user),
                token: result.token,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async requestPasswordReset(req, res, next) {
        try {
            const parsed = auth_validators_1.requestPasswordResetSchema.parse(req.body);
            const result = await auth_service_1.AuthService.requestPasswordReset(parsed);
            // result is { ok: true } or { ok: true, resetCode }
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const parsed = auth_validators_1.resetPasswordSchema.parse(req.body);
            await auth_service_1.AuthService.resetPassword(parsed);
            res.json({ ok: true });
        }
        catch (err) {
            next(err);
        }
    }
    static async logout(req, res, next) {
        try {
            // Stateless logout: client should simply delete the token
            return res.json({ ok: true, message: "Logged out" });
        }
        catch (err) {
            next(err);
        }
    }
    static async resendVerification(req, res, next) {
        try {
            // expect { email }
            const emailBody = (req.body && req.body.email) ? { email: String(req.body.email) } : null;
            if (!emailBody || !emailBody.email) {
                return res.status(400).json({ message: "email is required" });
            }
            const result = await auth_service_1.AuthService.resendVerification(emailBody);
            // returns { ok: true } or { ok:true, verificationCode }
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async resendPasswordReset(req, res, next) {
        try {
            const emailBody = (req.body && req.body.email) ? { email: String(req.body.email) } : null;
            if (!emailBody || !emailBody.email) {
                return res.status(400).json({ message: "email is required" });
            }
            const result = await auth_service_1.AuthService.resendPasswordReset(emailBody);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map