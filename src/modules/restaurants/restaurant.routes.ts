import { Router } from "express";
import {
  listRestaurants,
  getRestaurantById,
  createRestaurant,
} from "./restaurant.controller";
// If you want to protect create/update with auth, import authMiddleware later
// import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

// Public endpoints for home screen & detail screens
router.get("/", listRestaurants);
router.get("/:id", getRestaurantById);

// Optional: admin / seeding
// router.post("/", authMiddleware, createRestaurant);

export default router;
