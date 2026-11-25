import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppException } from '../../common/errors/app-exception.js';
import type { RequestMeta } from '../../common/http/request-meta.js';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { generateOpaqueToken, hashToken } from './token.service.js';

export interface IssuedSession {
  sessionId: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
}

const DAY_MS = 86_400_000;

/**
 * Refresh-token sessions with rotation and reuse detection.
 *
 * Every refresh consumes the presented token and issues a new one in the
 * same family. If a consumed token is presented again after the grace window,
 * we assume it was stolen and revoke the entire family, logging out both the
 * attacker and the legitimate user.
 *
 * The grace window tolerates benign races: two tabs, or parallel page loads,
 * refreshing with the same cookie at the same moment.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENV) private readonly env: Env,
  ) {}

  async create(userId: string, meta: RequestMeta, familyId: string = randomUUID()): Promise<IssuedSession> {
    const { token, hash } = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + this.env.REFRESH_TOKEN_TTL_DAYS * DAY_MS);
    const session = await this.prisma.session.create({
      data: { userId, familyId, tokenHash: hash, expiresAt, ipAddress: meta.ipAddress, userAgent: meta.userAgent },
    });
    return { sessionId: session.id, userId, refreshToken: token, expiresAt };
  }

  async rotate(refreshToken: string, meta: RequestMeta): Promise<IssuedSession> {
    const now = new Date();
    const current = await this.prisma.session.findUnique({ where: { tokenHash: hashToken(refreshToken) } });

    if (!current || current.revokedAt || current.expiresAt <= now) {
      throw new AppException('UNAUTHENTICATED', 'Session expired. Please sign in again.');
    }

    if (current.rotatedAt === null) {
      // Atomically claim the token; only one concurrent request can win.
      const claimed = await this.prisma.session.updateMany({
        where: { id: current.id, rotatedAt: null, revokedAt: null },
        data: { rotatedAt: now },
      });
      if (claimed.count === 1) return this.create(current.userId, meta, current.familyId);
    }

    // The token was already rotated. Tolerate it only inside the grace window.
    const rotatedAt = current.rotatedAt ?? now;
    const withinGrace = now.getTime() - rotatedAt.getTime() <= this.env.REFRESH_REUSE_GRACE_SECONDS * 1000;
    if (withinGrace) return this.create(current.userId, meta, current.familyId);

    await this.revokeFamily(current.familyId);
    this.logger.warn(
      { userId: current.userId, familyId: current.familyId, ip: meta.ipAddress },
      'Refresh token reuse detected; session family revoked',
    );
    throw new AppException('UNAUTHENTICATED', 'Session expired. Please sign in again.');
  }

  async revokeByToken(refreshToken: string): Promise<void> {
    const current = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      select: { familyId: true },
    });
    if (current) await this.revokeFamily(current.familyId);
  }

  async revokeById(sessionId: string): Promise<void> {
    const current = await this.prisma.session.findUnique({ where: { id: sessionId }, select: { familyId: true } });
    if (current) await this.revokeFamily(current.familyId);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.session.updateMany({ where: { familyId, revokedAt: null }, data: { revokedAt: new Date() } });
  }
}
