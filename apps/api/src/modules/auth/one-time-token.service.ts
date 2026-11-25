import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/errors/app-exception.js';
import type { Prisma, TokenPurpose } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { generateOpaqueToken, hashToken } from './token.service.js';

const TTL_MS: Record<TokenPurpose, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 30 * 60 * 1000,
};

/** Single-use, short-lived tokens delivered by email (verification, password reset). */
@Injectable()
export class OneTimeTokenService {
  constructor(private readonly prisma: PrismaService) {}

  /** Issues a fresh token and invalidates any outstanding tokens of the same purpose. */
  async issue(userId: string, purpose: TokenPurpose): Promise<string> {
    const { token, hash } = generateOpaqueToken();
    await this.prisma.$transaction([
      this.prisma.verificationToken.deleteMany({ where: { userId, purpose, usedAt: null } }),
      this.prisma.verificationToken.create({
        data: { userId, purpose, tokenHash: hash, expiresAt: new Date(Date.now() + TTL_MS[purpose]) },
      }),
    ]);
    return token;
  }

  /** Marks the token used inside the caller's transaction and returns its user id. */
  async consume(tx: Prisma.TransactionClient, token: string, purpose: TokenPurpose): Promise<string> {
    const invalid = new AppException('INVALID_TOKEN', 'This link is invalid or has expired.');
    const now = new Date();
    const record = await tx.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record || record.purpose !== purpose || record.usedAt || record.expiresAt <= now) throw invalid;

    const { count } = await tx.verificationToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: now },
    });
    if (count !== 1) throw invalid;
    return record.userId;
  }
}
