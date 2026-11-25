import type { PermissionName, RoleName } from './roles.js';

/** The user shape the API exposes to clients. Never includes secrets. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  roles: RoleName[];
  permissions: PermissionName[];
  createdAt: string;
}
