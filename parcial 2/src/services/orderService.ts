import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export class OrderService {
  async createOrder(operatorId: number, items: CreateOrderItem[]) {
    // Se valida que haya al menos un producto
    if (!items || items.length === 0) {
      throw new AppError('El pedido debe contener al menos un producto', 400);
    }

    return prisma.$transaction(async (tx) => {
      const productsToUpdate: { id: number; stock: number; price: number }[] = [];

      // Verificar stock y preparar datos
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new AppError(`Producto con ID ${item.productId} no encontrado`, 404);
        }
        if (item.quantity <= 0) {
          throw new AppError(`Cantidad inválida para el producto "${product.name}"`, 400);
        }
        if (product.stock < item.quantity) {
          throw new AppError(
            `Stock insuficiente para el producto "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
            400
          );
        }
        productsToUpdate.push({
          id: product.id,
          stock: product.stock - item.quantity,
          price: product.price,
        });
      }

      // Crear la orden
      const order = await tx.order.create({
        data: {
          operatorId,
          status: 'PENDING',
        },
      });

      // Crear OrderItems y actualizar stock
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const prod = productsToUpdate[i];
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: prod.price,
          },
        });
        await tx.product.update({
          where: { id: prod.id },
          data: { stock: prod.stock },
        });
      }

      // Retornar la orden completa con sus items y productos asociados
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: { product: true },
          },
          operator: {
            select: { id: true, email: true, role: true },
          },
        },
      });
    });
  }

  async getOrderById(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        operator: {
          select: { id: true, email: true, role: true },
        },
      },
    });
    if (!order) {
      throw new AppError('Pedido no encontrado', 404);
    }
    return order;
  }

  async updateOrderStatus(orderId: number, newStatus: string) {
    const validStatuses = ['PENDING', 'DISPATCHED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError(`Estado inválido. Estados permitidos: ${validStatuses.join(', ')}`, 400);
    }

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new AppError('Pedido no encontrado', 404);
      }

      if (order.status === 'CANCELLED') {
        throw new AppError('No se puede modificar un pedido cancelado', 400);
      }

      // Si se cancela, devolver el stock
      if (newStatus === 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
          items: {
            include: { product: true },
          },
          operator: {
            select: { id: true, email: true, role: true },
          },
        },
      });

      return updatedOrder;
    });
  }
}