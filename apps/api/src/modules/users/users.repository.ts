import { Injectable } from '@nestjs/common';
import type { PermissionName, RoleName } from '@academy/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const withAccess = {
  roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
} satisfies Prisma.UserInclude;

export type UserWithAccess = Prisma.UserGetPayload<{ include: typeof withAccess }>;

/** Flattens the user → roles → permissions join into name arrays. */
export function accessOf(user: UserWithAccess): { roles: RoleName[]; permissions: PermissionName[] } {
  const roles = user.roles.map((ur) => ur.role.name as RoleName);
  const permissions = new Set<PermissionName>();
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) permissions.add(rp.permission.name as PermissionName);
  }
  return { roles, permissions: [...permissions].sort() };
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserWithAccess | null> {
    return this.prisma.user.findUnique({ where: { email }, include: withAccess });
  }

  findById(id: string): Promise<UserWithAccess | null> {
    return this.prisma.user.findUnique({ where: { id }, include: withAccess });
  }

  /** Loads a user only if the given session is still live; used by the auth guard on every request. */
  findActiveBySession(userId: string, sessionId: string): Promise<UserWithAccess | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        disabledAt: null,
        sessions: { some: { id: sessionId, revokedAt: null } },
      },
      include: withAccess,
    });
  }

  createWithRole(data: { email: string; name: string; passwordHash: string }, role: RoleName): Promise<UserWithAccess> {
    return this.prisma.user.create({
      data: { ...data, roles: { create: { role: { connect: { name: role } } } } },
      include: withAccess,
    });
  }

  updatePasswordHash(userId: string, passwordHash: string): Promise<unknown> {
    return this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  recordLogin(userId: string): Promise<unknown> {
    return this.prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  }

  async list(params: { skip: number; take: number }): Promise<{ items: UserWithAccess[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ ...params, orderBy: { createdAt: 'desc' }, include: withAccess }),
      this.prisma.user.count(),
    ]);
    return { items, total };
  }
}
