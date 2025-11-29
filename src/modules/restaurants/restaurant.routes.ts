import { Router } from "express";
import {
  listRestaurants,
  getRestaurantById,
  createRestaurant,
} from "./restaurant.controller";
import menuRouter from "../menu/menu.routes";

const router = Router();

// /api/restaurants
router.get("/", listRestaurants);
router.post("/", createRestaurant);

// /api/restaurants/:id
router.get("/:id", getRestaurantById);

// Nested menu routes: /api/restaurants/:restaurantId/menu
router.use("/:restaurantId/menu", menuRouter);

export default router;
