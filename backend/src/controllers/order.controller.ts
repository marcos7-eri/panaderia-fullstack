import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../errors/api-error';
import { optionalText, parseId, positiveInteger } from '../utils/validation';

const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: []
};

type RequestedItem = {
  productId: number;
  quantity: number;
};

function parseItems(value: unknown): RequestedItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(400, 'El pedido debe contener al menos un producto.');
  }

  const items = value.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new ApiError(400, `El producto en la posición ${index + 1} no es válido.`);
    }

    const record = item as Record<string, unknown>;
    return {
      productId: parseId(String(record.productId)),
      quantity: positiveInteger(record.quantity, `items[${index}].quantity`)
    };
  });

  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new ApiError(400, 'No repitas un producto; utiliza una sola cantidad por producto.');
  }

  return items;
}

export const listOrders: RequestHandler = async (request, response) => {
  const customerId = request.query.customerId
    ? parseId(String(request.query.customerId))
    : undefined;
  const statusValue = typeof request.query.status === 'string'
    ? request.query.status.toUpperCase()
    : undefined;

  if (statusValue && !ORDER_STATUSES.includes(statusValue as OrderStatus)) {
    throw new ApiError(400, 'El estado solicitado no es válido.');
  }

  const orders = await prisma.order.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      ...(statusValue ? { status: statusValue as OrderStatus } : {})
    },
    include: {
      customer: true,
      _count: { select: { items: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  response.json(orders);
};

export const getOrder: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });

  if (!order) throw new ApiError(404, 'El pedido no existe.');
  response.json(order);
};

export const trackOrder: RequestHandler = async (request, response) => {
  const id = parseId(String(request.query.id));
  const email = String(request.query.email ?? '').trim().toLowerCase();
  if (!email) throw new ApiError(400, 'Debes indicar el correo del cliente.');

  const order = await prisma.order.findFirst({
    where: { id, customer: { email } },
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: { include: { product: { select: { name: true, imageUrl: true } } } }
    }
  });

  if (!order) throw new ApiError(404, 'No encontramos un pedido con esos datos.');
  response.json(order);
};

export const createOrder: RequestHandler = async (request, response) => {
  const body = request.body ?? {};
  const customerId = parseId(String(body.customerId));
  const requestedItems = parseItems(body.items);
  const notes = optionalText(body.notes, 'notes');

  const order = await prisma.$transaction(async (transaction) => {
    const customer = await transaction.customer.findFirst({
      where: { id: customerId, active: true },
      select: { id: true }
    });
    if (!customer) throw new ApiError(400, 'El cliente no existe o está inactivo.');

    const products = await transaction.product.findMany({
      where: { id: { in: requestedItems.map((item) => item.productId) }, active: true }
    });

    if (products.length !== requestedItems.length) {
      throw new ApiError(400, 'Uno o más productos no existen o están inactivos.');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const orderItems = requestedItems.map((item) => {
      const product = productsById.get(item.productId);
      if (!product || product.stock < item.quantity) {
        throw new ApiError(409, `Stock insuficiente para el producto ${product?.name ?? item.productId}.`);
      }

      const unitPrice = Number(product.price);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal: Number((unitPrice * item.quantity).toFixed(2))
      };
    });

    for (const item of orderItems) {
      const updated = await transaction.product.updateMany({
        where: { id: item.productId, active: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      });

      if (updated.count !== 1) {
        throw new ApiError(409, 'El stock cambió mientras se procesaba el pedido. Inténtalo nuevamente.');
      }
    }

    const total = Number(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    return transaction.order.create({
      data: {
        customerId,
        total,
        notes,
        items: { create: orderItems }
      },
      include: { customer: true, items: { include: { product: true } } }
    });
  });

  response.status(201).json(order);
};

export const updateOrderStatus: RequestHandler = async (request, response) => {
  const id = parseId(String(request.params.id));
  const requestedStatus = String(request.body?.status ?? '').toUpperCase() as OrderStatus;

  if (!ORDER_STATUSES.includes(requestedStatus)) {
    throw new ApiError(400, 'El estado indicado no es válido.');
  }

  const order = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.order.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!existing) throw new ApiError(404, 'El pedido no existe.');

    const currentStatus = existing.status as OrderStatus;
    if (currentStatus === requestedStatus) return existing;

    if (!ALLOWED_TRANSITIONS[currentStatus].includes(requestedStatus)) {
      throw new ApiError(
        409,
        `No se puede cambiar un pedido de ${currentStatus} a ${requestedStatus}.`
      );
    }

    if (requestedStatus === 'CANCELLED') {
      for (const item of existing.items) {
        await transaction.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }

    return transaction.order.update({
      where: { id },
      data: { status: requestedStatus },
      include: { customer: true, items: { include: { product: true } } }
    });
  });

  response.json(order);
};

