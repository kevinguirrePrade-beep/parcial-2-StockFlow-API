import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();
const orderController = new OrderController();

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    ).min(1, 'Debe incluir al menos un producto'),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'DISPATCHED', 'CANCELLED']),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
});

router.post(
  '/',
  authMiddleware,
  validateRequest(createOrderSchema),
  (req, res, next) => orderController.create(req, res, next)
);

router.get(
  '/:id',
  authMiddleware,
  (req, res, next) => orderController.getById(req, res, next)
);

router.patch(
  '/:id/status',
  authMiddleware,
  validateRequest(updateStatusSchema),
  (req, res, next) => orderController.updateStatus(req, res, next)
);

export default router;