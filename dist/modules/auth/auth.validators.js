"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.requestPasswordResetSchema = exports.verifyEmailSchema = exports.loginSchema = exports.signupSchema = void 0;
// src/modules/auth/auth.validators.ts
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.email("Invalid email"), // <- using z.email() as requested
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email"),
    password: zod_1.z.string().min(1),
});
exports.verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email"),
    code: zod_1.z.string().length(4, "Code must be 4 digits"),
});
exports.requestPasswordResetSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email"),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email"),
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 chars"),
});
//# sourceMappingURL=auth.validators.js.map