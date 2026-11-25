import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  emailOnlySchema,
  type EmailOnlyInput,
  loginSchema,
  type LoginInput,
  type PublicUser,
  registerSchema,
  type RegisterInput,
  resetPasswordSchema,
  type ResetPasswordInput,
  verifyEmailSchema,
  type VerifyEmailInput,
} from '@academy/shared';
import type { Request, Response } from 'express';
import { type AuthUser, toPublicUser } from '../../common/auth/auth-user.js';
import { CurrentUser, Public } from '../../common/auth/decorators.js';
import { AppException } from '../../common/errors/app-exception.js';
import { ReqMeta, type RequestMeta } from '../../common/http/request-meta.js';
import { ApiZodBody, ZodValidationPipe } from '../../common/validation/zod.js';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';
import { clearAuthCookies, readCookie, REFRESH_COOKIE, setAuthCookies } from './auth.cookies.js';
import { AuthService } from './auth.service.js';

/** Strict limit for credential and email-sending endpoints, per client IP. */
const STRICT = { default: { limit: 10, ttl: 60_000 } };
const GENERIC_EMAIL_MESSAGE = 'If the address can receive email, a message is on its way.';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(ENV) private readonly env: Env,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(STRICT)
  @ApiZodBody(registerSchema)
  @ApiOperation({ summary: 'Create an account and send a verification email' })
  async register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput): Promise<{ message: string }> {
    await this.auth.register(body);
    return { message: 'Check your inbox to verify your email address.' };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT)
  @ApiZodBody(loginSchema)
  @ApiOperation({ summary: 'Sign in; sets httpOnly access and refresh cookies' })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: PublicUser }> {
    const { user, tokens } = await this.auth.login(body, meta);
    setAuthCookies(res, tokens, this.env);
    return { user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  async refresh(
    @Req() req: Request,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: PublicUser }> {
    const token = readCookie(req, REFRESH_COOKIE);
    if (!token) throw new AppException('UNAUTHENTICATED', 'Session expired. Please sign in again.');
    try {
      const { user, tokens } = await this.auth.refresh(token, meta);
      setAuthCookies(res, tokens, this.env);
      return { user };
    } catch (err) {
      clearAuthCookies(res, this.env);
      throw err;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session and clear cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(readCookie(req, REFRESH_COOKIE), req.user?.sessionId);
    clearAuthCookies(res, this.env);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Revoke every session for the current user' })
  async logoutAll(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logoutEverywhere(user.id);
    clearAuthCookies(res, this.env);
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'The signed-in user' })
  me(@CurrentUser() user: AuthUser): { user: PublicUser } {
    return { user: toPublicUser(user) };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT)
  @ApiZodBody(verifyEmailSchema)
  @ApiOperation({ summary: 'Confirm an email address with the emailed token' })
  async verifyEmail(@Body(new ZodValidationPipe(verifyEmailSchema)) body: VerifyEmailInput): Promise<{ message: string }> {
    await this.auth.verifyEmail(body);
    return { message: 'Email verified. You can now sign in.' };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiZodBody(emailOnlySchema)
  @ApiOperation({ summary: 'Send a new verification email' })
  async resend(@Body(new ZodValidationPipe(emailOnlySchema)) body: EmailOnlyInput): Promise<{ message: string }> {
    await this.auth.resendVerification(body);
    return { message: GENERIC_EMAIL_MESSAGE };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiZodBody(emailOnlySchema)
  @ApiOperation({ summary: 'Email a password reset link' })
  async forgotPassword(@Body(new ZodValidationPipe(emailOnlySchema)) body: EmailOnlyInput): Promise<{ message: string }> {
    await this.auth.forgotPassword(body);
    return { message: GENERIC_EMAIL_MESSAGE };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT)
  @ApiZodBody(resetPasswordSchema)
  @ApiOperation({ summary: 'Set a new password with the emailed token; signs out all sessions' })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.auth.resetPassword(body);
    clearAuthCookies(res, this.env);
    return { message: 'Password updated. Sign in with your new password.' };
  }
}
