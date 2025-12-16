import { Router } from "express";
import { OrderController } from "./order.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

// create order (order food + address)
router.post("/", authMiddleware, OrderController.create);

// mark as paid
router.patch("/:id/pay", authMiddleware, OrderController.markPaid);

// my orders list (for receipts/history)
router.get("/", authMiddleware, OrderController.listMine);

router.post("/:id/pay", authMiddleware, OrderController.pay);

// single order details (receipt)
router.get("/:id", authMiddleware, OrderController.getById);

export default router;
