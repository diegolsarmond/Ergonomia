import localforage from 'localforage';
import type { Permission, UserRole } from './authTypes';
import { ROLE_PERMISSIONS_STORAGE_KEY } from './authDefaults';
import { ROLE_PERMISSIONS } from './permissions';

export type RolePermissionsMap = Record<UserRole, Permission[]>;

/**
 * Retorna o mapa de permissões por perfil.
 * Se não houver configuração salva, retorna o padrão definido em permissions.ts.
 */
export async function getRolePermissions(): Promise<RolePermissionsMap> {
  const saved = await localforage.getItem<RolePermissionsMap>(ROLE_PERMISSIONS_STORAGE_KEY);
  if (!saved) return { ...ROLE_PERMISSIONS };

  // Garante que ADMIN sempre possui todas as permissões, independente do que estiver salvo.
  return {
    ...saved,
    ADMIN: [...ROLE_PERMISSIONS.ADMIN],
  };
}

/**
 * Persiste o mapa de permissões por perfil.
 * ADMIN é sempre restaurado para todas as permissões antes de salvar.
 */
export async function saveRolePermissions(map: RolePermissionsMap): Promise<void> {
  const safe: RolePermissionsMap = {
    ...map,
    ADMIN: [...ROLE_PERMISSIONS.ADMIN],
  };
  await localforage.setItem(ROLE_PERMISSIONS_STORAGE_KEY, safe);
}

/**
 * Remove a configuração salva e volta ao padrão de permissions.ts.
 */
export async function resetRolePermissionsToDefault(): Promise<void> {
  await localforage.removeItem(ROLE_PERMISSIONS_STORAGE_KEY);
}
