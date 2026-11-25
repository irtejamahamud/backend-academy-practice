import type { EmailOnlyInput, LoginInput, PublicUser, RegisterInput, ResetPasswordInput } from '@academy/shared';
import { api } from '../api/client';

type Message = { message: string };

/** Client-side auth operations. Components call these; they never build requests themselves. */
export const authApi = {
  register: (input: RegisterInput) => api<Message>('/auth/register', { method: 'POST', body: input, noRetry: true }),
  login: (input: LoginInput) => api<{ user: PublicUser }>('/auth/login', { method: 'POST', body: input, noRetry: true }),
  logout: () => api<void>('/auth/logout', { method: 'POST', noRetry: true }),
  verifyEmail: (token: string) => api<Message>('/auth/verify-email', { method: 'POST', body: { token }, noRetry: true }),
  resendVerification: (input: EmailOnlyInput) =>
    api<Message>('/auth/resend-verification', { method: 'POST', body: input, noRetry: true }),
  forgotPassword: (input: EmailOnlyInput) =>
    api<Message>('/auth/forgot-password', { method: 'POST', body: input, noRetry: true }),
  resetPassword: (input: ResetPasswordInput) =>
    api<Message>('/auth/reset-password', { method: 'POST', body: input, noRetry: true }),
};
