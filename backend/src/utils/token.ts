import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from '../errors/api-error';

export type AuthPayload = {
  userId: number;
  email: string;
  role: 'ADMIN';
  exp: number;
};

function secret(): string {
  return process.env.AUTH_SECRET ?? 'clave_de_desarrollo_cambiar_en_produccion';
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createToken(payload: Omit<AuthPayload, 'exp'>): string {
  const completePayload: AuthPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60
  };
  const encodedPayload = Buffer.from(JSON.stringify(completePayload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyToken(token: string): AuthPayload {
  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) throw new ApiError(401, 'Token inválido.');

  const expectedSignature = Buffer.from(sign(encodedPayload));
  const actualSignature = Buffer.from(providedSignature);
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    throw new ApiError(401, 'Token inválido.');
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as AuthPayload;
    if (!payload.userId || payload.role !== 'ADMIN' || payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new ApiError(401, 'La sesión expiró.');
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Token inválido.');
  }
}

