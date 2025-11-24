import { Router } from "express";
import { getMeHandler } from "./user.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

export const userRouter = Router();

// GET /api/users/me
userRouter.get("/me", authMiddleware, getMeHandler);
