import { describe, expect, it } from 'vitest';
import { loginSchema, passwordSchema, registerSchema } from './auth.js';

describe('passwordSchema', () => {
  it('accepts a long passphrase with a digit', () => {
    expect(passwordSchema.safeParse('correct horse 9').success).toBe(true);
  });
  it('rejects short passwords', () => {
    expect(passwordSchema.safeParse('abc123').success).toBe(false);
  });
  it('rejects letters-only passwords', () => {
    expect(passwordSchema.safeParse('onlyletterspassword').success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('normalises email case and whitespace', () => {
    const r = registerSchema.parse({ name: ' Ada ', email: '  Ada@Example.COM ', password: 'longpassword1' });
    expect(r.email).toBe('ada@example.com');
    expect(r.name).toBe('Ada');
  });
});

describe('loginSchema', () => {
  it('rejects malformed email', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
});
