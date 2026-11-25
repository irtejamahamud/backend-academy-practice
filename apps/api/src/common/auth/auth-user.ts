import type { PermissionName, PublicUser, RoleName } from '@academy/shared';

/** The authenticated principal attached to `req.user` by the auth guard. */
export interface AuthUser {
  id: string;
  sessionId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  roles: RoleName[];
  permissions: PermissionName[];
  createdAt: Date;
}

export function toPublicUser(u: Omit<AuthUser, 'sessionId'>): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    roles: u.roles,
    permissions: u.permissions,
    createdAt: u.createdAt.toISOString(),
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
