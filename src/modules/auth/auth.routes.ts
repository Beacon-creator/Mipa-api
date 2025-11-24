import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  verifyEmailHandler,
  requestResetHandler,
  resetPasswordHandler,
} from "./auth.controller";

const router = Router();

// POST /api/auth/register
router.post("/register", registerHandler);

// POST /api/auth/login
router.post("/login", loginHandler);

// POST /api/auth/verify-email
router.post("/verify-email", verifyEmailHandler);

// POST /api/auth/request-password-reset
router.post("/request-password-reset", requestResetHandler);

// POST /api/auth/reset-password
router.post("/reset-password", resetPasswordHandler);

export default router;
