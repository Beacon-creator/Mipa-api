import { Request, Response, NextFunction } from "express";
import OrderService from "./order.service";
import { CreateOrderDto } from "./create-order.dto";

export class OrderController {

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;
      const dto = req.body as CreateOrderDto;
      const order = await OrderService.createOrder(userId, dto);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  static async markPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;
      const orderId = req.params.id as string;
      const { paymentStatus, paymentMethod } = req.body;
      const order = await OrderService.markPaid(userId, orderId, { paymentStatus, paymentMethod });
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  static async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;
      const orders = await OrderService.listMine(userId);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;
      const orderId = req.params.id as string;
      const order = await OrderService.getById(userId, orderId);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }
}
