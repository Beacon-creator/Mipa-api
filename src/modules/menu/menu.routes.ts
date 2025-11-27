import { Router } from "express";
import { MenuController } from "./menu.controller";

const router = Router();

// GET /api/menu?restaurantId=&type=&search=&minPrice=&maxPrice=
router.get("/", MenuController.list);

// GET /api/menu/:id
router.get("/:id", MenuController.getById);

// POST /api/menu
router.post("/", MenuController.create);

export default router;
