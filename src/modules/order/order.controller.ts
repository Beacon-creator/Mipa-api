import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Order } from "./order.model";
import { MenuItem } from "../menu/menuItem.model";

function generateOrderNumber() {

  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
}

// DTO helper
function toOrderDTO(order: any) {
  return {
    id: order.id,
    user: order.user,
    restaurant: order.restaurant,
    items: order.items,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    address: order.address,
    notes: order.notes,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
  };
}

export class OrderController {

static async create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const {
      restaurantId,
      items,
      address,
      paymentMethod = "card",
      notes,
    } = req.body as {
      restaurantId: string;
      items: { menuItemId: string; quantity: number }[];
      address: any;
      paymentMethod?: "card" | "cash" | "wallet";
      notes?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Validate restaurantId
    if (!Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurantId" });
    }

    // Validate each menuItemId
    const validItems = items.filter((i) => Types.ObjectId.isValid(i.menuItemId));
    if (validItems.length !== items.length) {
      return res.status(400).json({ message: "One or more menuItemIds are invalid" });
    }

    // Fetch menu items
    const menuItemIds = validItems.map((i) => new Types.ObjectId(i.menuItemId));
    const menuDocs = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuDocs.length !== validItems.length) {
      return res.status(400).json({ message: "One or more menu items do not exist" });
    }

    // Map items with price & subtotal
    const orderItems = validItems.map((i) => {
      const doc = menuDocs.find((m) => m._id.toString() === i.menuItemId);
      if (!doc) throw new Error("Menu item mismatch");
      return {
        menuItem: doc._id,
        name: doc.name,
        price: doc.price,
        quantity: i.quantity,
        subtotal: doc.price * i.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      user: new Types.ObjectId(userId),
      restaurant: new Types.ObjectId(restaurantId),
      items: orderItems,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod,
      totalAmount,
      address,
      notes: notes ?? "",
      orderNumber: generateOrderNumber(),
    });

    res.status(201).json(toOrderDTO(order));
  } catch (err) {
    next(err);
  }
}


  static async markPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;
      const orderId = req.params.id as string; // ensure string, not string | undefined

      const { paymentStatus = "paid", paymentMethod } = req.body as {
        paymentStatus?: "paid" | "failed";
        paymentMethod?: "card" | "cash" | "wallet";
      };

      const update: any = {
        paymentStatus,
      };
      if (paymentStatus === "paid") {
        update.status = "confirmed";
      }
      if (paymentMethod) {
        update.paymentMethod = paymentMethod;
      }

      const order = await Order.findOneAndUpdate(
        { _id: orderId, user: userId },
        update,
        { new: true }
      );

      if (!order) return res.status(404).json({ message: "Order not found" });

      res.json(toOrderDTO(order));
    } catch (err) {
      next(err);
    }
  }

  static async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;

      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("restaurant", "name location");

      res.json(orders.map(toOrderDTO));
    } catch (err) {
      next(err);
    }
  }


  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;
      const orderId = req.params.id as string;

      const order = await Order.findOne({ _id: orderId, user: userId }).populate(
        "restaurant",
        "name location"
      );

      if (!order) return res.status(404).json({ message: "Order not found" });

      res.json(toOrderDTO(order));
    } catch (err) {
      next(err);
    }
  }
}
