"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRestaurants = listRestaurants;
exports.getRestaurantById = getRestaurantById;
exports.createRestaurant = createRestaurant;
const restaurant_model_1 = require("./restaurant.model");
// GET /api/restaurants
// Supports filters for search, location, category, minRating, maxDistanceKm plus pagination
async function listRestaurants(req, res, next) {
    try {
        const { search, location, category, minRating, maxDistanceKm, page = "1", limit = "20", } = req.query;
        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        if (location) {
            // Simple "contains" match; can refine later
            filter.location = { $regex: location, $options: "i" };
        }
        if (category) {
            filter.categories = { $in: [category] };
        }
        if (minRating) {
            filter.rating = { ...(filter.rating || {}), $gte: Number(minRating) };
        }
        if (maxDistanceKm) {
            filter.distanceKm = {
                ...(filter.distanceKm || {}),
                $lte: Number(maxDistanceKm),
            };
        }
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            restaurant_model_1.Restaurant.find(filter)
                .sort({ rating: -1 }) // best-rated first
                .skip(skip)
                .limit(limitNum),
            restaurant_model_1.Restaurant.countDocuments(filter),
        ]);
        res.json({
            items,
            page: pageNum,
            limit: limitNum,
            total,
        });
    }
    catch (err) {
        next(err);
    }
}
// GET /api/restaurants/:id
async function getRestaurantById(req, res, next) {
    try {
        const { id } = req.params;
        const restaurant = await restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        // Later you can also populate menu items / reviews here
        res.json(restaurant);
    }
    catch (err) {
        next(err);
    }
}
// (Optional) POST /api/restaurants  – for seeding / admin
async function createRestaurant(req, res, next) {
    try {
        const restaurant = await restaurant_model_1.Restaurant.create(req.body);
        res.status(201).json(restaurant);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=restaurant.controller.js.map