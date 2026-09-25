import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
    update: {},
    create: {
      sku: 'PAN-001',
      name: 'Pan tradicional',
      description: 'Pan artesanal horneado cada mañana.',
      price: 1.5,
      stock: 50,
      categoryId: breads.id
    }
  });

  await prisma.product.upsert({
    where: { sku: 'TOR-001' },
    update: {},
    create: {
      sku: 'TOR-001',
      name: 'Torta de chocolate',
      description: 'Torta húmeda de chocolate con cobertura cremosa.',
      price: 85,
      stock: 8,
      categoryId: cakes.id
    }
  });

  await prisma.product.upsert({
    where: { sku: 'GAL-001' },
    update: {},
    create: {
      sku: 'GAL-001',
      name: 'Galletas de avena',
      description: 'Galletas artesanales de avena y pasas.',
      price: 12,
      stock: 25,
      categoryId: cookies.id
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

