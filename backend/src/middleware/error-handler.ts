import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ApiError } from '../errors/api-error';

type PrismaError = Error & {
  code?: string;
  meta?: unknown;
};

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    error: 'Ruta no encontrada.',
    path: request.originalUrl
  });
};

export const errorHandler: ErrorRequestHandler = (error: PrismaError, _request, response, _next) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      error: error.message,
      details: error.details
    });
    return;
  }

  if (error.code === 'P2002') {
    response.status(409).json({
      error: 'Ya existe un registro con esos datos únicos.',
      details: error.meta
    });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
};

