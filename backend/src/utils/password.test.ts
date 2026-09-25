import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from './password';

test('la contraseña se cifra y puede verificarse', () => {
  const hash = hashPassword('ClaveSegura123!');
  assert.notEqual(hash, 'ClaveSegura123!');
  assert.equal(verifyPassword('ClaveSegura123!', hash), true);
  assert.equal(verifyPassword('ClaveIncorrecta', hash), false);
});

