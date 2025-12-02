import { Router } from "express";
import {
  listMenuItems,
  getMenuItemById,
  createMenuItem,
} from "./menu.controller";

const router = Router();

router.get("/", listMenuItems);

router.get("/:id", getMenuItemById);

router.post("/", /* authMiddleware, */ createMenuItem);

export default router;
