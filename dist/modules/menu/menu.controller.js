"use strict";
// src/modules/menu/menu.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMenuItems = listMenuItems;
exports.getMenuItemById = getMenuItemById;
exports.createMenuItem = createMenuItem;
const menuItem_model_1 = require("./menuItem.model");
// GET /api/menu
// Query: restaurantId, search, type, minPrice, maxPrice, page, limit
async function listMenuItems(req, res, next) {
    try {
        const { restaurantId, search, type, minPrice, maxPrice, page = "1", limit = "20", } = req.query;
        const filter = {};
        if (restaurantId) {
            // Mongoose will cast string -> ObjectId for an ObjectId field
            filter.restaurant = restaurantId;
        }
        if (search) {
            // match name or description
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (type) {
            filter.type = type; // "food", "drink", etc.
        }
        if (minPrice) {
            filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
        }
        if (maxPrice) {
            filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
        }
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            menuItem_model_1.MenuItem.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            menuItem_model_1.MenuItem.countDocuments(filter),
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
// GET /api/menu/:id
async function getMenuItemById(req, res, next) {
    try {
        const { id } = req.params; // 👈 make it a string, not string | undefined
        const item = await menuItem_model_1.MenuItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        res.json(item);
    }
    catch (err) {
        next(err);
    }
}
// (Optional / dev): POST /api/menu – for seeding / admin panel
async function createMenuItem(req, res, next) {
    try {
        const { restaurantId, name, description, imageUrl, price, type, isAvailable = true, tags, } = req.body;
        if (!restaurantId) {
            return res.status(400).json({ message: "restaurantId is required" });
        }
        if (!name || price == null || !type) {
            return res.status(400).json({
                message: "name, price and type are required",
            });
        }
        // Build the document in a way that avoids undefined fields
        const toCreate = {
            restaurant: restaurantId, // will be cast to ObjectId
            name,
            price,
            type,
            isAvailable,
        };
        if (description !== undefined) {
            toCreate.description = description;
        }
        if (imageUrl !== undefined) {
            toCreate.imageUrl = imageUrl;
        }
        if (tags !== undefined) {
            toCreate.tags = tags;
        }
        const item = await menuItem_model_1.MenuItem.create(toCreate);
        res.status(201).json(item);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=menu.controller.js.map