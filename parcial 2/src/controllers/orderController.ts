import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { AuthRequest } from '../types';

const orderService = new OrderService();

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'No autenticado' });
      }
      const { items } = req.body; // items: { productId, quantity }[]
      const order = await orderService.createOrder(req.user.id, items);
      res.status(201).json({ status: 'success', data: order });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const order = await orderService.getOrderById(id);
      res.status(200).json({ status: 'success', data: order });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      res.status(200).json({ status: 'success', data: updatedOrder });
    } catch (err) {
      next(err);
    }
  }
}