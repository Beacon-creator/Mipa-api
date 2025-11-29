import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/password/forgot", AuthController.requestPasswordReset);
router.post("/password/reset", AuthController.resetPassword);
router.post("/logout", AuthController.logout);


export default router;
