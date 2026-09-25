import type { RequestHandler } from 'express';
import { ApiError } from '../errors/api-error';
import { verifyToken } from '../utils/token';

export const requireAdmin: RequestHandler = (request, _response, next) => {
  const authorization = request.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Debes iniciar sesión como administrador.');
  }

  const token = authorization.slice('Bearer '.length).trim();
  verifyToken(token);
  next();
};

