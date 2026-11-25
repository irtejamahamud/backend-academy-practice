import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: 'Enter a valid email address' }));

/**
 * Length beats composition rules (NIST SP 800-63B). We require a reasonable
 * minimum length and at least one letter and one digit-or-symbol, and cap the
 * length to bound hashing cost.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`)
  .refine((v) => /[A-Za-z]/.test(v), 'Include at least one letter')
  .refine((v) => /[^A-Za-z]/.test(v), 'Include at least one number or symbol');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long'),
  email,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(PASSWORD_MAX_LENGTH),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const emailOnlySchema = z.object({ email });
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;

const token = z.string().trim().min(32).max(256);

export const verifyEmailSchema = z.object({ token });
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resetPasswordSchema = z.object({ token, password: passwordSchema });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
