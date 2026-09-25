import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../errors/api-error';
import { optionalBoolean, optionalText, parseId, requiredText } from '../utils/validation';

export const listCategories: RequestHandler = async (request, response) => {
  const includeInactive = request.query.includeInactive === 'true';
  const categories = await prisma.category.findMany({
    where: includeInactive ? undefined : { active: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' }
  });

  response.json(categories);
};

export const getCategory: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: { where: { active: true }, orderBy: { name: 'asc' } } }
  });

  if (!category) throw new ApiError(404, 'La categoría no existe.');
  response.json(category);
};

export const createCategory: RequestHandler = async (request, response) => {
  const body = request.body ?? {};
  const category = await prisma.category.create({
    data: {
      name: requiredText(body.name, 'name'),
      description: optionalText(body.description, 'description')
    }
  });

  response.status(201).json(category);
};

export const updateCategory: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const body = request.body ?? {};
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'La categoría no existe.');

  const data = {
    name: body.name === undefined ? undefined : requiredText(body.name, 'name'),
    description: optionalText(body.description, 'description'),
    active: optionalBoolean(body.active, 'active')
  };

  if (Object.values(data).every((value) => value === undefined)) {
    throw new ApiError(400, 'Debes enviar al menos un campo para actualizar.');
  }

  const category = await prisma.category.update({ where: { id }, data });
  response.json(category);
};

export const deleteCategory: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'La categoría no existe.');

  await prisma.$transaction([
    prisma.product.updateMany({ where: { categoryId: id }, data: { active: false } }),
    prisma.category.update({ where: { id }, data: { active: false } })
  ]);

  response.status(204).send();
};

