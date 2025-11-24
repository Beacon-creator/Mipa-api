import { Router } from "express";
import { prisma } from "../db/client";
import type { Prisma } from "@prisma/client";

const router = Router();

// GET /restaurants?query=&minRating=&maxDistance=
router.get("/", async (req, res) => {
  try {
    const { query, minRating } = req.query;

    const where: Prisma.RestaurantWhereInput = {};

    if (query) {
      where.name = {
        contains: String(query),
        mode: "insensitive",
      };
    }

    if (minRating) {
      where.rating = {
        gte: Number(minRating),
      };
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: { menus: true },
    });

    res.json(restaurants);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /restaurants/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: true,
        reviews: true,
      },
    });

    if (!restaurant) return res.status(404).json({ error: "Not found" });

    res.json(restaurant);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
