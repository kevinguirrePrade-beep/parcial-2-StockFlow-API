
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/authMiddleware';
import { roleGuard } from './middlewares/roleGuard';
import { ProductController } from './controllers/productController';

const app = express();
const productController = new ProductController();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


app.get(
  '/api/reports/low-stock',
  authMiddleware,
  roleGuard('ADMIN'),
  (req, res, next) => productController.lowStock(req, res, next)
);

app.use(errorHandler);

export default app;