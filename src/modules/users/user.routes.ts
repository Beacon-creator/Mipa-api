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

router.get("/me", getMeHandler);

router.patch("/me/profile", updateProfileHandler);

router.patch("/me/email", updateEmailHandler);

router.patch("/me/password", updatePasswordHandler);

router.get("/me/payment-settings", getPaymentSettingsHandler);

router.patch("/me/payment-settings", updatePaymentSettingsHandler);

router.post("/contact", contactUsHandler);
router.post("/me/email/change/request", requestEmailChangeHandler);
router.post("/me/email/change/confirm", confirmEmailChangeHandler);

// Address management
router.get("/me/addresses", listAddressesHandler);
router.post("/me/addresses", upsertAddressHandler);
router.delete("/me/addresses/:addressId", deleteAddressHandler);
router.post("/me/addresses/:addressId/default", setDefaultAddressHandler);

export default router;
