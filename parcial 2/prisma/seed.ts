import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear usuarios por defecto
  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('oper123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stockflow.com' },
    update: {},
    create: {
      email: 'admin@stockflow.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'oper@stockflow.com' },
    update: {},
    create: {
      email: 'oper@stockflow.com',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  });

  // Crear categorías
  const cat1 = await prisma.category.upsert({
    where: { name: 'Electrónicos' },
    update: {},
    create: { name: 'Electrónicos' },
  });
  const cat2 = await prisma.category.upsert({
    where: { name: 'Muebles' },
    update: {},
    create: { name: 'Muebles' },
  });

  // Crear productos
  await prisma.product.upsert({
    where: { sku: 'ELEC001' },
    update: {},
    create: {
      name: 'Teclado mecánico',
      sku: 'ELEC001',
      stock: 15,
      minStock: 5,
      price: 89.99,
      categoryId: cat1.id,
    },
  });
  await prisma.product.upsert({
    where: { sku: 'ELEC002' },
    update: {},
    create: {
      name: 'Mouse inalámbrico',
      sku: 'ELEC002',
      stock: 3,
      minStock: 10,
      price: 45.5,
      categoryId: cat1.id,
    },
  });
  await prisma.product.upsert({
    where: { sku: 'MUE001' },
    update: {},
    create: {
      name: 'Escritorio gamer',
      sku: 'MUE001',
      stock: 2,
      minStock: 2,
      price: 299.99,
      categoryId: cat2.id,
    },
  });

  console.log('Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });