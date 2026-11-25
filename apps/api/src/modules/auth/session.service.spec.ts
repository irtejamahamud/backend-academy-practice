import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../../config/env.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { SessionService } from './session.service.js';
import { hashToken } from './token.service.js';

const meta = { ipAddress: '127.0.0.1', userAgent: 'vitest' };
const env = { REFRESH_TOKEN_TTL_DAYS: 30, REFRESH_REUSE_GRACE_SECONDS: 20 } as Env;

function makePrisma() {
  return {
    session: {
      findUnique: vi.fn(),
      create: vi.fn(async ({ data }) => ({ id: 'new-session', ...data })),
      updateMany: vi.fn(async () => ({ count: 1 })),
    },
  };
}

describe('SessionService.rotate', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: SessionService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new SessionService(prisma as unknown as PrismaService, env);
  });

  const live = (overrides = {}) => ({
    id: 's1',
    userId: 'u1',
    familyId: 'f1',
    tokenHash: hashToken('tok'),
    expiresAt: new Date(Date.now() + 60_000),
    rotatedAt: null,
    revokedAt: null,
    ...overrides,
  });

  it('rotates a live token into the same family', async () => {
    prisma.session.findUnique.mockResolvedValue(live());
    const issued = await service.rotate('tok', meta);
    expect(issued.refreshToken).not.toBe('tok');
    expect(prisma.session.create.mock.calls[0]![0].data.familyId).toBe('f1');
  });

  it('rejects unknown, revoked and expired tokens', async () => {
    prisma.session.findUnique.mockResolvedValueOnce(null);
    await expect(service.rotate('tok', meta)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    prisma.session.findUnique.mockResolvedValueOnce(live({ revokedAt: new Date() }));
    await expect(service.rotate('tok', meta)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    prisma.session.findUnique.mockResolvedValueOnce(live({ expiresAt: new Date(Date.now() - 1) }));
    await expect(service.rotate('tok', meta)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('tolerates reuse inside the grace window (concurrent refresh)', async () => {
    prisma.session.findUnique.mockResolvedValue(live({ rotatedAt: new Date(Date.now() - 5_000) }));
    await expect(service.rotate('tok', meta)).resolves.toMatchObject({ userId: 'u1' });
    expect(prisma.session.updateMany).not.toHaveBeenCalled();
  });

  it('revokes the whole family when a rotated token is replayed after the grace window', async () => {
    prisma.session.findUnique.mockResolvedValue(live({ rotatedAt: new Date(Date.now() - 60_000) }));
    await expect(service.rotate('tok', meta)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { familyId: 'f1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('issues into the family when it loses the atomic claim race', async () => {
    prisma.session.findUnique.mockResolvedValue(live());
    prisma.session.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.rotate('tok', meta)).resolves.toMatchObject({ userId: 'u1' });
  });
});
