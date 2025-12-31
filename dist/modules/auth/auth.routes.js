"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post("/signup", auth_controller_1.AuthController.signup);
router.post("/login", auth_controller_1.AuthController.login);
router.post("/verify-email", auth_controller_1.AuthController.verifyEmail);
router.post("/password/forgot", auth_controller_1.AuthController.requestPasswordReset);
router.post("/password/reset", auth_controller_1.AuthController.resetPassword);
router.post("/logout", auth_controller_1.AuthController.logout);
router.post("/resend-verification", auth_controller_1.AuthController.resendVerification);
router.post("/password/resend", auth_controller_1.AuthController.resendPasswordReset);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map