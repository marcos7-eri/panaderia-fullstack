import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@panaderia.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Administrador',
      passwordHash: hashPassword(adminPassword),
      active: true
    },
    create: {
      name: 'Administrador',
      email: adminEmail,
      passwordHash: hashPassword(adminPassword)
    }
  });

  const breads = await prisma.category.upsert({
    where: { name: 'Panes' },
    update: {},
    create: {
      name: 'Panes',
      description: 'Panes frescos elaborados diariamente.'
    }
  });

  const cakes = await prisma.category.upsert({
    where: { name: 'Tortas' },
    update: {},
    create: {
      name: 'Tortas',
      description: 'Tortas para celebraciones y ocasiones especiales.'
    }
  });

  const cookies = await prisma.category.upsert({
    where: { name: 'Galletas' },
    update: {},
    create: {
      name: 'Galletas',
      description: 'Galletas artesanales dulces y crocantes.'
    }
  });

  await prisma.product.upsert({
    where: { sku: 'PAN-001' },
    update: { imageUrl: '/productos/pan-artesanal.svg' },
    create: {
      sku: 'PAN-001',
      name: 'Pan tradicional',
      description: 'Pan artesanal horneado cada mañana.',
      price: 1.5,
      imageUrl: '/productos/pan-artesanal.svg',
      stock: 50,
      categoryId: breads.id
    }
  });

  await prisma.product.upsert({
    where: { sku: 'TOR-001' },
    update: { imageUrl: '/productos/torta-chocolate.svg' },
    create: {
      sku: 'TOR-001',
      name: 'Torta de chocolate',
      description: 'Torta húmeda de chocolate con cobertura cremosa.',
      price: 85,
      imageUrl: '/productos/torta-chocolate.svg',
      stock: 8,
      categoryId: cakes.id
    }
  });

  await prisma.product.upsert({
    where: { sku: 'GAL-001' },
    update: { imageUrl: '/productos/galletas-avena.svg' },
    create: {
      sku: 'GAL-001',
      name: 'Galletas de avena',
      description: 'Galletas artesanales de avena y pasas.',
      price: 12,
      imageUrl: '/productos/galletas-avena.svg',
      stock: 25,
      categoryId: cookies.id
    }
  });

  await prisma.customer.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      firstName: 'Cliente',
      lastName: 'Demostración',
      email: 'cliente@ejemplo.com',
      phone: '70000000',
      address: 'Dirección de ejemplo'
    }
  });

  console.log('Datos iniciales registrados correctamente.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

