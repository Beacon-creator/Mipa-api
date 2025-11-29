import { Router } from "express";
import {
  listMenuItems,
  getMenuItemById,
  createMenuItem,
} from "./menu.controller";
// import { authMiddleware } from "../../shared/middleware/auth.middleware"; // if needed

const router = Router();

// Public: list + search + filter
router.get("/", listMenuItems);

// Public: single menu item
router.get("/:id", getMenuItemById);

// Dev/Admin: create menu item (protect later with auth/roles)
router.post("/", /* authMiddleware, */ createMenuItem);

export default router;
