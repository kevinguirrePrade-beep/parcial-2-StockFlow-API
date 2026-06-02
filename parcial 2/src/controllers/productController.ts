import { Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { AuthRequest } from '../types';

const productService = new ProductService();

export class ProductController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const products = await productService.getAll({ categoryId });
      res.status(200).json({ status: 'success', results: products.length, data: products });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ status: 'success', data: product });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const product = await productService.update(id, req.body);
      res.status(200).json({ status: 'success', data: product });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await productService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async lowStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const products = await productService.getLowStock();
      res.status(200).json({ status: 'success', results: products.length, data: products });
    } catch (err) {
      next(err);
    }
  }
}