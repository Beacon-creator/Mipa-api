"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
// backend/src/modules/order/order.service.ts
const mongoose_1 = require("mongoose");
const order_model_1 = require("./order.model");
const menuItem_model_1 = require("../menu/menuItem.model");
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
/**
 * Convert Order mongoose doc -> DTO (same shape used by controller)
 */
function toOrderDTO(order) {
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
class OrderService {
    /**
     * Create an order for a user.
     * Throws errors (or returns rejected promise) on validation failure.
     */
    static async createOrder(userId, dto) {
        // Basic validation
        if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
            throw new Error("Order items are required");
        }
        if (!mongoose_1.Types.ObjectId.isValid(dto.restaurantId)) {
            throw new Error("Invalid restaurantId");
        }
        const validItems = dto.items.filter((i) => mongoose_1.Types.ObjectId.isValid(i.menuItemId));
        if (validItems.length !== dto.items.length) {
            throw new Error("One or more menuItemIds are invalid");
        }
        // Fetch menu items from DB
        const menuItemIds = validItems.map((i) => new mongoose_1.Types.ObjectId(i.menuItemId));
        const menuDocs = await menuItem_model_1.MenuItem.find({ _id: { $in: menuItemIds } });
        if (menuDocs.length !== validItems.length) {
            throw new Error("One or more menu items do not exist");
        }
        // Build order items (snapshot name/price/subtotal)
        const orderItems = validItems.map((i) => {
            const doc = menuDocs.find((m) => m._id.toString() === i.menuItemId);
            if (!doc)
                throw new Error("Menu item mismatch");
            return {
                menuItem: doc._id,
                name: doc.name,
                price: doc.price,
                quantity: i.quantity,
                subtotal: doc.price * i.quantity,
            };
        });
        const totalAmount = orderItems.reduce((s, it) => s + it.subtotal, 0);
        const order = await order_model_1.Order.create({
            user: new mongoose_1.Types.ObjectId(userId),
            restaurant: new mongoose_1.Types.ObjectId(dto.restaurantId),
            items: orderItems,
            status: "pending",
            paymentStatus: "unpaid",
            paymentMethod: dto.paymentMethod ?? "card",
            totalAmount,
            address: dto.address,
            notes: dto.notes ?? "",
            orderNumber: generateOrderNumber(),
        });
        return toOrderDTO(order);
    }
    /**
     * Mark an order paid (or update payment status)
     */
    static async markPaid(userId, orderId, opts = {}) {
        const order = await order_model_1.Order.findOne({ _id: orderId, user: userId });
        if (!order)
            throw new Error("Order not found");
        // 🚫 Prevent double payment
        if (order.paymentStatus === "paid") {
            throw new Error("Order has already been paid");
        }
        order.paymentStatus = opts.paymentStatus ?? "paid";
        if (order.paymentStatus === "paid") {
            order.status = "confirmed";
        }
        if (opts.paymentMethod) {
            order.paymentMethod = opts.paymentMethod;
        }
        await order.save();
        return toOrderDTO(order);
    }
    static async listMine(userId) {
        const orders = await order_model_1.Order.find({ user: userId }).sort({ createdAt: -1 }).populate("restaurant", "name location");
        return orders.map(toOrderDTO);
    }
    static async getById(userId, orderId) {
        let query = { user: userId };
        // If valid ObjectId → search by _id
        if (mongoose_1.Types.ObjectId.isValid(orderId)) {
            query._id = new mongoose_1.Types.ObjectId(orderId);
        }
        // Otherwise → search by orderNumber
        else {
            query.orderNumber = orderId;
        }
        const order = await order_model_1.Order.findOne(query).populate("restaurant", "name location");
        if (!order) {
            throw new Error("Order not found");
        }
        return toOrderDTO(order);
    }
}
exports.OrderService = OrderService;
exports.default = OrderService;
//# sourceMappingURL=order.service.js.map