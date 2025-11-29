// src/modules/menu/menu.controller.ts

import { Request, Response, NextFunction } from "express";
import { MenuItem } from "./menuItem.model";

// GET /api/menu
// Query: restaurantId, search, type, minPrice, maxPrice, page, limit
export async function listMenuItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      restaurantId,
      search,
      type,
      minPrice,
      maxPrice,
      page = "1",
      limit = "20",
    } = req.query as {
      restaurantId?: string;
      search?: string;
      type?: string;
      minPrice?: string;
      maxPrice?: string;
      page?: string;
      limit?: string;
    };

    const filter: Record<string, any> = {};

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
      MenuItem.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      MenuItem.countDocuments(filter),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/menu/:id
export async function getMenuItemById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params as { id: string }; // 👈 make it a string, not string | undefined
    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
}

// (Optional / dev): POST /api/menu – for seeding / admin panel
export async function createMenuItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      restaurantId,
      name,
      description,
      imageUrl,
      price,
      type,
      isAvailable = true,
      tags,
    } = req.body as {
      restaurantId?: string;
      name?: string;
      description?: string;
      imageUrl?: string;
      price?: number;
      type?: string;
      isAvailable?: boolean;
      tags?: string[];
    };

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    if (!name || price == null || !type) {
      return res.status(400).json({
        message: "name, price and type are required",
      });
    }

    // Build the document in a way that avoids undefined fields
    const toCreate: Record<string, any> = {
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

    const item = await MenuItem.create(toCreate);

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}
