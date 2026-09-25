import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../errors/api-error';
import { emailText, requiredText } from '../utils/validation';
import { verifyPassword } from '../utils/password';
import { createToken, verifyToken } from '../utils/token';

export const login: RequestHandler = async (request, response) => {
  const body = request.body ?? {};
  const email = emailText(body.email);
  const password = requiredText(body.password, 'password');
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    throw new ApiError(401, 'Correo o contraseña incorrectos.');
  }

  const token = createToken({ userId: user.id, email: user.email, role: 'ADMIN' });
  response.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const currentUser: RequestHandler = async (request, response) => {
  const token = request.header('authorization')!.slice('Bearer '.length).trim();
  const payload = verifyToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, active: true }
  });

  if (!user?.active) throw new ApiError(401, 'La cuenta ya no está activa.');
  response.json(user);
};

