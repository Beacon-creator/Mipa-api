"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = __importDefault(require("./order.service"));
class OrderController {
    static async create(req, res, next) {
        try {
            const userId = req.userId;
            const dto = req.body;
            const order = await order_service_1.default.createOrder(userId, dto);
            res.status(201).json(order);
        }
        catch (err) {
            next(err);
        }
    }
    static async markPaid(req, res, next) {
        try {
            const userId = req.userId;
            const orderId = req.params.id;
            const { paymentStatus, paymentMethod } = req.body;
            const order = await order_service_1.default.markPaid(userId, orderId, { paymentStatus, paymentMethod });
            res.json(order);
        }
        catch (err) {
            next(err);
        }
    }
    static async listMine(req, res, next) {
        try {
            const userId = req.userId;
            const orders = await order_service_1.default.listMine(userId);
            res.json(orders);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const userId = req.userId;
            const orderId = req.params.id;
            const order = await order_service_1.default.getById(userId, orderId);
            res.json(order);
        }
        catch (err) {
            next(err);
        }
    }
    static async pay(req, res, next) {
        try {
            const userId = req.userId;
            const orderId = req.params.id;
            const order = await order_service_1.default.markPaid(userId, orderId, {
                paymentStatus: "paid",
                paymentMethod: "card",
            });
            res.json(order);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map