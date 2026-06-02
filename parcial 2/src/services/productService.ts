import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ProductService {
  async getAll(filters?: { categoryId?: number }) {
    const where: any = {};
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    return prisma.product.findMany({
      where,
      include: { category: true },
    });
  }

  async getById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new AppError('Producto no encontrado', 404);
    return product;
  }

  async create(data: {
    name: string;
    sku: string;
    stock: number;
    minStock: number;
    price: number;
    categoryId: number;
  }) {
    // Verificar categoría existe
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new AppError('La categoría especificada no existe', 400);

    return prisma.product.create({ data, include: { category: true } });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      sku: string;
      stock: number;
      minStock: number;
      price: number;
      categoryId: number;
    }>
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Producto no encontrado', 404);

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new AppError('Categoría no encontrada', 400);
    }

    return prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async delete(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Producto no encontrado', 404);
    // Eliminación física (se podría hacer lógica con un campo "deletedAt", según el requerimiento se acepta)
    await prisma.product.delete({ where: { id } });
  }

  async getLowStock() {
    return prisma.product.findMany({
      where: {
        stock: { lte: prisma.product.fields.minStock },
      },
      include: { category: true },
    });
  }
}