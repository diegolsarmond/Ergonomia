import type { Permission } from './authTypes';

/** Permissões do perfil fixo ADMIN — não editáveis. */
export const ADMIN_PERMISSIONS: Permission[] = [
  'USERS_VIEW',
  'USERS_CREATE',
  'USERS_EDIT',
  'USERS_DELETE',
  'PROJECTS_VIEW',
  'PROJECTS_CREATE',
  'PROJECTS_EDIT',
  'PROJECTS_DELETE',
  'AEP_VIEW',
  'AEP_CREATE',
  'AEP_EDIT',
  'AEP_DELETE',
  'AEP_PRINT',
  'AET_VIEW',
  'AET_CREATE',
  'AET_EDIT',
  'AET_DELETE',
  'AET_PRINT',
  'CATALOG_VIEW',
  'CATALOG_EDIT',
  'SETTINGS_VIEW',
  'SETTINGS_EDIT',
];

/** @deprecated Use ADMIN_PERMISSIONS diretamente. Mantido por compatibilidade com AuthContext. */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: ADMIN_PERMISSIONS,
};
