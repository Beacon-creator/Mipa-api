"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// create order (order food + address)
router.post("/", auth_middleware_1.authMiddleware, order_controller_1.OrderController.create);
// mark as paid
router.patch("/:id/pay", auth_middleware_1.authMiddleware, order_controller_1.OrderController.markPaid);
// my orders list (for receipts/history)
router.get("/", auth_middleware_1.authMiddleware, order_controller_1.OrderController.listMine);
router.post("/:id/pay", auth_middleware_1.authMiddleware, order_controller_1.OrderController.pay);
// single order details (receipt)
router.get("/:id", auth_middleware_1.authMiddleware, order_controller_1.OrderController.getById);
exports.default = router;
//# sourceMappingURL=order.routes.js.map