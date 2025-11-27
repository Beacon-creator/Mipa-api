import { Router } from "express";
import { getMeHandler, updateMeHandler } from "./user.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

export const userRouter = Router();

// GET /api/users/me
userRouter.get("/me", authMiddleware, getMeHandler);

// PATCH /api/users/me
userRouter.patch("/me", authMiddleware, updateMeHandler);

export default userRouter;
