"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const avatar_utils_1 = require("./avatar.utils");
const router = (0, express_1.Router)();
// All routes here require auth
router.use(auth_middleware_1.authMiddleware);
router.get("/me", user_controller_1.getMeHandler);
router.patch("/me/profile", user_controller_1.updateProfileHandler);
router.post("/me/avatar", auth_middleware_1.authMiddleware, auth_middleware_1.avatarUploadLimiter, auth_middleware_1.uploadAvatar.single("avatar"), avatar_utils_1.processAvatar, user_controller_1.uploadAvatarHandler);
router.patch("/me/email", user_controller_1.updateEmailHandler);
router.patch("/me/password", user_controller_1.updatePasswordHandler);
router.get("/me/payment-settings", user_controller_1.getPaymentSettingsHandler);
router.patch("/me/payment-settings", user_controller_1.updatePaymentSettingsHandler);
router.post("/contact", user_controller_1.contactUsHandler);
router.post("/me/email/change/request", user_controller_1.requestEmailChangeHandler);
router.post("/me/email/change/confirm", user_controller_1.confirmEmailChangeHandler);
// Address management
router.get("/me/addresses", user_controller_1.listAddressesHandler);
router.post("/me/addresses", user_controller_1.upsertAddressHandler);
router.delete("/me/addresses/:addressId", user_controller_1.deleteAddressHandler);
router.post("/me/addresses/:addressId/default", user_controller_1.setDefaultAddressHandler);
exports.default = router;
//# sourceMappingURL=user.routes.js.map