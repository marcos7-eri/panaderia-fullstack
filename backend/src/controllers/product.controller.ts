import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../errors/api-error';
import {
  nonNegativeInteger,
  optionalBoolean,
  optionalText,
  parseId,
  positiveNumber,
  requiredText
} from '../utils/validation';

async function ensureCategory(categoryId: number) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, active: true },
    select: { id: true }
  });

  if (!category) throw new ApiError(400, 'La categoría indicada no existe o está inactiva.');
}

export const listProducts: RequestHandler = async (request, response) => {
  const includeInactive = request.query.includeInactive === 'true';
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';
  const categoryId = request.query.categoryId ? parseId(String(request.query.categoryId)) : undefined;

  const products = await prisma.product.findMany({
    where: {
      ...(includeInactive ? {} : { active: true }),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {})
    },
    include: { category: true },
    orderBy: { name: 'asc' }
  });

  response.json(products);
};

export const getProduct: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!product) throw new ApiError(404, 'El producto no existe.');
  response.json(product);
};

export const createProduct: RequestHandler = async (request, response) => {
  const body = request.body ?? {};
  const categoryId = parseId(String(body.categoryId));
  await ensureCategory(categoryId);

  const product = await prisma.product.create({
    data: {
      sku: requiredText(body.sku, 'sku').toUpperCase(),
      name: requiredText(body.name, 'name'),
      description: optionalText(body.description, 'description'),
      price: positiveNumber(body.price, 'price'),
      imageUrl: optionalText(body.imageUrl, 'imageUrl'),
      stock: nonNegativeInteger(body.stock ?? 0, 'stock'),
      categoryId
    },
    include: { category: true }
  });

  response.status(201).json(product);
};

export const updateProduct: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const body = request.body ?? {};
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'El producto no existe.');

  const categoryId = body.categoryId === undefined
    ? undefined
    : parseId(String(body.categoryId));
  if (categoryId !== undefined) await ensureCategory(categoryId);

  const data = {
    sku: body.sku === undefined
      ? undefined
      : requiredText(body.sku, 'sku').toUpperCase(),
    name: body.name === undefined
      ? undefined
      : requiredText(body.name, 'name'),
    description: optionalText(body.description, 'description'),
    price: body.price === undefined
      ? undefined
      : positiveNumber(body.price, 'price'),
    imageUrl: optionalText(body.imageUrl, 'imageUrl'),
    stock: body.stock === undefined
      ? undefined
      : nonNegativeInteger(body.stock, 'stock'),
    active: optionalBoolean(body.active, 'active'),
    categoryId
  };

  if (Object.values(data).every((value) => value === undefined)) {
    throw new ApiError(400, 'Debes enviar al menos un campo para actualizar.');
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true }
  });

  response.json(product);
};

export const deleteProduct: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'El producto no existe.');

  await prisma.product.update({ where: { id }, data: { active: false } });
  response.status(204).send();
};

