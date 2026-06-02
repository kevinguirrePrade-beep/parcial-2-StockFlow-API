import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();
const productController = new ProductController();

// Esquemas de validación
const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    stock: z.number().int().min(0),
    minStock: z.number().int().min(0),
    price: z.number().positive(),
    categoryId: z.number().int(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    minStock: z.number().int().min(0).optional(),
    price: z.number().positive().optional(),
    categoryId: z.number().int().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
});

// Ruta pública (autenticada) para obtener productos
router.get('/', authMiddleware, (req, res, next) =>
  productController.getAll(req, res, next)
);

// Rutas exclusivas de ADMIN
router.post(
  '/',
  authMiddleware,
  roleGuard('ADMIN'),
  validateRequest(createProductSchema),
  (req, res, next) => productController.create(req, res, next)
);

router.put(
  '/:id',
  authMiddleware,
  roleGuard('ADMIN'),
  validateRequest(updateProductSchema),
  (req, res, next) => productController.update(req, res, next)
);

router.delete(
  '/:id',
  authMiddleware,
  roleGuard('ADMIN'),
  (req, res, next) => productController.delete(req, res, next)
);

// Reporte de bajo stock (solo ADMIN)
router.get(
  '/low-stock',
  authMiddleware,
  roleGuard('ADMIN'),
  (req, res, next) => productController.lowStock(req, res, next)
);

export default router;