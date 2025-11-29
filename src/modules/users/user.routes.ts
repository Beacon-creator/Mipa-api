import { Router } from "express";
import {
  getMeHandler,
  updateProfileHandler,
  updateEmailHandler,
  updatePasswordHandler,
  getPaymentSettingsHandler,
  updatePaymentSettingsHandler,
  contactUsHandler,
  setDefaultAddressHandler,
  deleteAddressHandler,
  upsertAddressHandler,
  listAddressesHandler,
  confirmEmailChangeHandler,
  requestEmailChangeHandler
} from "./user.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

// All routes here require auth
router.use(authMiddleware);

// GET /api/users/me
router.get("/me", getMeHandler);

// PATCH /api/users/me/profile
router.patch("/me/profile", updateProfileHandler);

// PATCH /api/users/me/email
router.patch("/me/email", updateEmailHandler);

// PATCH /api/users/me/password
router.patch("/me/password", updatePasswordHandler);

// GET /api/users/me/payment-settings
router.get("/me/payment-settings", getPaymentSettingsHandler);

// PATCH /api/users/me/payment-settings
router.patch("/me/payment-settings", updatePaymentSettingsHandler);

// POST /api/users/contact
router.post("/contact", contactUsHandler);

// Email change with OTP (dev-style: returns code in JSON)
router.post("/me/email/change/request", requestEmailChangeHandler);
router.post("/me/email/change/confirm", confirmEmailChangeHandler);

// Address management
router.get("/me/addresses", listAddressesHandler);
router.post("/me/addresses", upsertAddressHandler);
router.delete("/me/addresses/:addressId", deleteAddressHandler);
router.post("/me/addresses/:addressId/default", setDefaultAddressHandler);

export default router;
