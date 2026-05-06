import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { AppUser, UserRole, UserStatus } from './authTypes';
import { USERS_STORAGE_KEY } from './authDefaults';
import { createPasswordRecord } from './passwordService';
import { getRolePermissions } from './rolePermissionRepository';

// ── Storage ──────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AppUser[]> {
  const users = await localforage.getItem<AppUser[]>(USERS_STORAGE_KEY);
  return users ?? [];
}

export async function saveUsers(users: AppUser[]): Promise<void> {
  await localforage.setItem(USERS_STORAGE_KEY, users);
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function findUserByUsername(username: string): Promise<AppUser | undefined> {
  const users = await getUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export async function findUserById(id: string): Promise<AppUser | undefined> {
  const users = await getUsers();
  return users.find(u => u.id === id);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface CreateUserInput {
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  mustChangePassword?: boolean;
}

export async function createUser(input: CreateUserInput): Promise<AppUser> {
  const { passwordHash, passwordSalt } = await createPasswordRecord(input.password);
  const now = new Date().toISOString();

  const user: AppUser = {
    id: uuidv4(),
    name: input.name,
    email: input.email,
    username: input.username,
    passwordHash,
    passwordSalt,
    role: input.role,
    permissions: (await getRolePermissions())[input.role],
    status: input.status ?? 'active',
    mustChangePassword: input.mustChangePassword ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const users = await getUsers();
  await saveUsers([...users, user]);
  return user;
}

export type UpdateUserPatch = Partial<Omit<AppUser, 'id' | 'passwordHash' | 'passwordSalt' | 'createdAt'>>;

export async function updateUser(id: string, patch: UpdateUserPatch): Promise<AppUser | null> {
  const users = await getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;

  const updated: AppUser = {
    ...users[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };

  users[idx] = updated;
  await saveUsers(users);
  return updated;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  await saveUsers(filtered);
  return true;
}

// ── Seed ─────────────────────────────────────────────────────────────────────

/**
 * ATENÇÃO — Usuário admin/admin é TEMPORÁRIO e deve ser removido antes da
 * entrega ao cliente. Ele existe apenas para facilitar o desenvolvimento local.
 *
 * ⛔ NUNCA habilitar em produção.
 *
 * Condições para execução:
 * - import.meta.env.DEV === true  (build de desenvolvimento)
 * - import.meta.env.PROD !== true (salvaguarda adicional contra builds de produção)
 *
 * Consulte SECURITY_AUTH.md para instruções de remoção antes da entrega.
 */
export async function seedDevelopmentAdminUser(): Promise<void> {
  // Salvaguarda dupla: não executa em produção sob nenhuma circunstância.
  if (import.meta.env.PROD) return;
  if (!import.meta.env.DEV) return;

  console.warn(
    '[DEV] seedDevelopmentAdminUser: criando usuário admin/admin temporário. ' +
    'Este usuário DEVE ser removido antes da entrega ao cliente. ' +
    'Consulte SECURITY_AUTH.md.',
  );

  const existing = await findUserByUsername('admin');
  if (existing) return;

  await createUser({
    name: 'Administrador Local',
    email: 'admin@localhost.dev',
    username: 'admin',
    password: 'admin',
    role: 'ADMIN',
    status: 'active',
    mustChangePassword: true,
  });
}
