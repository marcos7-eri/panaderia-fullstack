import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../errors/api-error';
import {
  emailText,
  optionalBoolean,
  optionalText,
  parseId,
  requiredText
} from '../utils/validation';

export const listCustomers: RequestHandler = async (request, response) => {
  const includeInactive = request.query.includeInactive === 'true';
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';

  const customers = await prisma.customer.findMany({
    where: {
      ...(includeInactive ? {} : { active: true }),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {})
    },
    include: { _count: { select: { orders: true } } },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
  });

  response.json(customers);
};

export const getCustomer: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        select: { id: true, status: true, total: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!customer) throw new ApiError(404, 'El cliente no existe.');
  response.json(customer);
};

export const createCustomer: RequestHandler = async (request, response) => {
  const body = request.body ?? {};
  const email = emailText(body.email);
  const existing = await prisma.customer.findUnique({ where: { email } });

  if (existing) {
    const customer = await prisma.customer.update({
      where: { id: existing.id },
      data: {
        firstName: requiredText(body.firstName, 'firstName'),
        lastName: requiredText(body.lastName, 'lastName'),
        phone: optionalText(body.phone, 'phone'),
        address: optionalText(body.address, 'address'),
        active: true
      }
    });
    response.json(customer);
    return;
  }

  const customer = await prisma.customer.create({
    data: {
      firstName: requiredText(body.firstName, 'firstName'),
      lastName: requiredText(body.lastName, 'lastName'),
      email,
      phone: optionalText(body.phone, 'phone'),
      address: optionalText(body.address, 'address')
    }
  });

  response.status(201).json(customer);
};

export const updateCustomer: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const body = request.body ?? {};
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'El cliente no existe.');

  const data = {
    firstName: body.firstName === undefined
      ? undefined
      : requiredText(body.firstName, 'firstName'),
    lastName: body.lastName === undefined
      ? undefined
      : requiredText(body.lastName, 'lastName'),
    email: body.email === undefined ? undefined : emailText(body.email),
    phone: optionalText(body.phone, 'phone'),
    address: optionalText(body.address, 'address'),
    active: optionalBoolean(body.active, 'active')
  };

  if (Object.values(data).every((value) => value === undefined)) {
    throw new ApiError(400, 'Debes enviar al menos un campo para actualizar.');
  }

  const customer = await prisma.customer.update({ where: { id }, data });
  response.json(customer);
};

export const deleteCustomer: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'El cliente no existe.');

  await prisma.customer.update({ where: { id }, data: { active: false } });
  response.status(204).send();
};

