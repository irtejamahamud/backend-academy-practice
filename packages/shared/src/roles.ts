export const ROLES = ['STUDENT', 'ADMIN'] as const;
export type RoleName = (typeof ROLES)[number];

/**
 * Fine-grained permissions. Roles are bundles of permissions; server-side
 * guards check permissions rather than role names wherever practical so that
 * new roles (e.g. REVIEWER, AUTHOR) can be introduced without code changes.
 */
export const PERMISSIONS = [
  'content:read',
  'content:write',
  'content:publish',
  'users:read',
  'users:manage',
  'exams:grade',
  'analytics:read',
] as const;
export type PermissionName = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<RoleName, readonly PermissionName[]> = {
  STUDENT: ['content:read'],
  ADMIN: PERMISSIONS,
};
