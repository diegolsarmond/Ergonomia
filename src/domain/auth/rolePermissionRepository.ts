import localforage from 'localforage';
import type { CustomProfile, Permission } from './authTypes';
import {
  ROLE_PERMISSIONS_STORAGE_KEY,
  CUSTOM_PROFILES_STORAGE_KEY,
} from './authDefaults';
import { ADMIN_PERMISSIONS } from './permissions';

export type RolePermissionsMap = Record<string, Permission[]>;

// ── Custom Profiles ────────────────────────────────────────────────────────────

export async function getCustomProfiles(): Promise<CustomProfile[]> {
  return (await localforage.getItem<CustomProfile[]>(CUSTOM_PROFILES_STORAGE_KEY)) ?? [];
}

export async function saveCustomProfile(profile: CustomProfile): Promise<void> {
  const profiles = await getCustomProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  await localforage.setItem(CUSTOM_PROFILES_STORAGE_KEY, profiles);
}

export async function deleteCustomProfile(id: string): Promise<void> {
  const profiles = await getCustomProfiles();
  await localforage.setItem(
    CUSTOM_PROFILES_STORAGE_KEY,
    profiles.filter(p => p.id !== id),
  );
}

// ── Role Permissions Map ───────────────────────────────────────────────────────

/**
 * Retorna o mapa de permissões por perfil.
 * ADMIN sempre possui todas as permissões. Os demais são perfis customizados.
 */
export async function getRolePermissions(): Promise<RolePermissionsMap> {
  const customProfiles = await getCustomProfiles();
  const map: RolePermissionsMap = { ADMIN: [...ADMIN_PERMISSIONS] };
  for (const p of customProfiles) {
    map[p.id] = p.permissions;
  }
  return map;
}

/**
 * Persiste as permissões de um perfil customizado.
 * Ignora alterações no ADMIN (sempre possui todas as permissões).
 * @deprecated Prefira saveCustomProfile() diretamente. Mantido para compatibilidade.
 */
export async function saveRolePermissions(map: RolePermissionsMap): Promise<void> {
  const profiles = await getCustomProfiles();
  const updated = profiles.map(p => ({
    ...p,
    permissions: map[p.id] ?? p.permissions,
  }));
  await localforage.setItem(CUSTOM_PROFILES_STORAGE_KEY, updated);
  // Limpa a chave antiga de role_permissions caso exista
  await localforage.removeItem(ROLE_PERMISSIONS_STORAGE_KEY);
}

/**
 * Remove todos os perfis customizados.
 */
export async function resetRolePermissionsToDefault(): Promise<void> {
  await localforage.removeItem(CUSTOM_PROFILES_STORAGE_KEY);
  await localforage.removeItem(ROLE_PERMISSIONS_STORAGE_KEY);
}
