import { Router } from "express";
import { OrderController } from "./order.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

export const orderRouter = Router();

// create order (order food + address)
orderRouter.post("/", authMiddleware, OrderController.create);

// mark as paid
orderRouter.patch("/:id/pay", authMiddleware, OrderController.markPaid);

// my orders list (for receipts/history)
orderRouter.get("/", authMiddleware, OrderController.listMine);

// single order details (receipt)
orderRouter.get("/:id", authMiddleware, OrderController.getById);
