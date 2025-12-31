"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restaurant_controller_1 = require("./restaurant.controller");
const menu_routes_1 = __importDefault(require("../menu/menu.routes"));
const router = (0, express_1.Router)();
// /api/restaurants
router.get("/", restaurant_controller_1.listRestaurants);
router.post("/", restaurant_controller_1.createRestaurant);
// /api/restaurants/:id
router.get("/:id", restaurant_controller_1.getRestaurantById);
// Nested menu routes: /api/restaurants/:restaurantId/menu
router.use("/:restaurantId/menu", menu_routes_1.default);
exports.default = router;
//# sourceMappingURL=restaurant.routes.js.map