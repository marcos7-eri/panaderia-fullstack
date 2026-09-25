import assert from 'node:assert/strict';
import test from 'node:test';
import { emailText, nonNegativeInteger, parseId, positiveNumber } from './validation';

test('acepta identificadores, precios, existencias y correos válidos', () => {
  assert.equal(parseId('7'), 7);
  assert.equal(positiveNumber('12.50', 'price'), 12.5);
  assert.equal(nonNegativeInteger(0, 'stock'), 0);
  assert.equal(emailText('CLIENTE@EJEMPLO.COM'), 'cliente@ejemplo.com');
});

test('rechaza valores inválidos', () => {
  assert.throws(() => parseId('0'));
  assert.throws(() => positiveNumber(-1, 'price'));
  assert.throws(() => nonNegativeInteger(2.5, 'stock'));
  assert.throws(() => emailText('correo-invalido'));
});

