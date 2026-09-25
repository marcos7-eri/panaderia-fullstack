import assert from 'node:assert/strict';
import test from 'node:test';
import { createToken, verifyToken } from './token';

test('crea y valida una sesión administrativa firmada', () => {
  process.env.AUTH_SECRET = 'secreto_exclusivo_para_pruebas';
  const token = createToken({ userId: 1, email: 'admin@panaderia.com', role: 'ADMIN' });
  const payload = verifyToken(token);
  assert.equal(payload.userId, 1);
  assert.equal(payload.email, 'admin@panaderia.com');
});

test('rechaza un token alterado', () => {
  process.env.AUTH_SECRET = 'secreto_exclusivo_para_pruebas';
  const token = createToken({ userId: 1, email: 'admin@panaderia.com', role: 'ADMIN' });
  assert.throws(() => verifyToken(`${token}alterado`));
});

