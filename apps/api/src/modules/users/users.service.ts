import { Injectable } from '@nestjs/common';
import type { PublicUser } from '@academy/shared';
import { toPublicUser } from '../../common/auth/auth-user.js';
import { accessOf, UsersRepository, type UserWithAccess } from './users.repository.js';

export function userToPublic(user: UserWithAccess): PublicUser {
  return toPublicUser({
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt,
    ...accessOf(user),
  });
}

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async list(page: number, pageSize: number): Promise<{ items: PublicUser[]; total: number }> {
    const { items, total } = await this.users.list({ skip: (page - 1) * pageSize, take: pageSize });
    return { items: items.map(userToPublic), total };
  }
}
