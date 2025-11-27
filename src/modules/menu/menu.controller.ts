import { Request, Response, NextFunction } from "express";
import { MenuItem } from "./menuItem.model";

export class MenuController {
  /**
   * GET /api/menu
   * Query params:
   *  - restaurantId (required for your app)
   *  - type (optional: "food", "drink", "snacks"...)
   *  - search (optional: dish name search)
   *  - minPrice, maxPrice (optional)
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        restaurantId,
        type,
        search,
        minPrice,
        maxPrice,
      } = req.query as Record<string, string | undefined>;

      const filter: any = {};

      if (restaurantId) {
        filter.restaurant = restaurantId;
      }

      if (type) {
        filter.type = type;
      }

      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const items = await MenuItem.find(filter).sort({ createdAt: -1 });

      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/menu/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await MenuItem.findById(id);
      if (!item) return res.status(404).json({ message: "Menu item not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/menu
   * Simple admin/seed endpoint (not protected here, but you can add auth/roles).
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurant, name, description, price, imageUrl, type, tags } =
        req.body;

      const item = await MenuItem.create({
        restaurant,
        name,
        description,
        price,
        imageUrl,
        type,
        tags,
      });

      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
}
