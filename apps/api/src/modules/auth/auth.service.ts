import { Injectable, Logger } from '@nestjs/common';
import type {
  EmailOnlyInput,
  LoginInput,
  PublicUser,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '@academy/shared';
import { AppException } from '../../common/errors/app-exception.js';
import type { RequestMeta } from '../../common/http/request-meta.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { UsersRepository } from '../users/users.repository.js';
import { userToPublic } from '../users/users.service.js';
import { OneTimeTokenService } from './one-time-token.service.js';
import { PasswordService } from './password.service.js';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly tokens: TokenService,
    private readonly oneTime: OneTimeTokenService,
    private readonly mail: MailService,
  ) {}

  /**
   * Always resolves the same way, whether or not the email is registered, so
   * the endpoint cannot be used to enumerate accounts. The mailbox owner gets
   * the appropriate email either way.
   */
  async register(input: RegisterInput): Promise<void> {
    // Hash first, unconditionally, so both branches take similar time.
    const passwordHash = await this.passwords.hash(input.password);
    const existing = await this.users.findByEmail(input.email);

    if (existing) {
      if (existing.emailVerifiedAt) {
        await this.mail.sendAccountExists(existing.email, existing.name);
      } else {
        const token = await this.oneTime.issue(existing.id, 'EMAIL_VERIFICATION');
        await this.mail.sendVerification(existing.email, existing.name, token);
      }
      return;
    }

    try {
      const user = await this.users.createWithRole({ email: input.email, name: input.name, passwordHash }, 'STUDENT');
      const token = await this.oneTime.issue(user.id, 'EMAIL_VERIFICATION');
      await this.mail.sendVerification(user.email, user.name, token);
      this.logger.log({ userId: user.id }, 'User registered');
    } catch (err) {
      // A concurrent registration for the same email won the race; respond identically.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return;
      throw err;
    }
  }

  async login(input: LoginInput, meta: RequestMeta): Promise<AuthResult> {
    const invalid = new AppException('INVALID_CREDENTIALS', 'Incorrect email or password.');
    const user = await this.users.findByEmail(input.email);

    if (!user) {
      await this.passwords.burnTime(input.password);
      throw invalid;
    }
    if (!(await this.passwords.verify(user.passwordHash, input.password)) || user.disabledAt) {
      throw invalid;
    }
    // Only revealed after a correct password, so it doesn't leak account existence.
    if (!user.emailVerifiedAt) {
      throw new AppException('EMAIL_NOT_VERIFIED', 'Verify your email address before signing in.');
    }

    if (this.passwords.needsRehash(user.passwordHash)) {
      await this.users.updatePasswordHash(user.id, await this.passwords.hash(input.password));
    }
    await this.users.recordLogin(user.id);

    const session = await this.sessions.create(user.id, meta);
    return { user: userToPublic(user), tokens: await this.toTokens(session) };
  }

  async refresh(refreshToken: string, meta: RequestMeta): Promise<AuthResult> {
    const session = await this.sessions.rotate(refreshToken, meta);
    const user = await this.users.findActiveBySession(session.userId, session.sessionId);
    if (!user) {
      await this.sessions.revokeById(session.sessionId);
      throw new AppException('UNAUTHENTICATED', 'Session expired. Please sign in again.');
    }
    return { user: userToPublic(user), tokens: await this.toTokens(session) };
  }

  async logout(refreshToken: string | undefined, sessionId: string | undefined): Promise<void> {
    if (refreshToken) await this.sessions.revokeByToken(refreshToken);
    if (sessionId) await this.sessions.revokeById(sessionId);
  }

  logoutEverywhere(userId: string): Promise<void> {
    return this.sessions.revokeAllForUser(userId);
  }

  async verifyEmail({ token }: VerifyEmailInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const userId = await this.oneTime.consume(tx, token, 'EMAIL_VERIFICATION');
      await tx.user.updateMany({ where: { id: userId, emailVerifiedAt: null }, data: { emailVerifiedAt: new Date() } });
    });
  }

  async resendVerification({ email }: EmailOnlyInput): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || user.emailVerifiedAt || user.disabledAt) return;
    const token = await this.oneTime.issue(user.id, 'EMAIL_VERIFICATION');
    await this.mail.sendVerification(user.email, user.name, token);
  }

  async forgotPassword({ email }: EmailOnlyInput): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || user.disabledAt) return;
    const token = await this.oneTime.issue(user.id, 'PASSWORD_RESET');
    await this.mail.sendPasswordReset(user.email, user.name, token);
  }

  /** Sets the new password, proves email ownership, and signs out every existing session. */
  async resetPassword({ token, password }: ResetPasswordInput): Promise<void> {
    const passwordHash = await this.passwords.hash(password);
    await this.prisma.$transaction(async (tx) => {
      const userId = await this.oneTime.consume(tx, token, 'PASSWORD_RESET');
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
      });
      await tx.verificationToken.deleteMany({ where: { userId, purpose: 'PASSWORD_RESET', usedAt: null } });
      await tx.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    });
  }

  private async toTokens(session: { userId: string; sessionId: string; refreshToken: string; expiresAt: Date }): Promise<AuthTokens> {
    return {
      accessToken: await this.tokens.signAccessToken({ userId: session.userId, sessionId: session.sessionId }),
      refreshToken: session.refreshToken,
      refreshExpiresAt: session.expiresAt,
    };
  }
}
