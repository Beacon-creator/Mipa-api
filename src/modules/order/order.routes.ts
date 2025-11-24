import { Router } from "express";
import { prisma } from "../db/client";

const router = Router();

// TODO: protect with auth middleware later
router.post("/", async (req, res) => {
  try {
    const { userId, items } = req.body as {
      userId: string;
      items: { menuItemId: string; quantity: number }[];
    };

    if (!userId || !items?.length) {
      return res.status(400).json({ error: "Invalid payload" });
    }

  const menuItems: { id: string; price: number }[] = await prisma.menuItem.findMany({
  where: { id: { in: items.map((i) => i.menuItemId) } },
});

    const total = items.reduce((sum, item) => {
      const found = menuItems.find((m) => m.id === item.menuItemId);
      return found ? sum + found.price * item.quantity : sum;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
