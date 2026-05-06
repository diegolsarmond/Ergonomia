/**
 * ATENÇÃO — Implementação temporária para ambiente local (frontend-only).
 *
 * Esta implementação usa Web Crypto API com SHA-256, que é adequada para
 * proteger senhas em armazenamento local (localforage), mas NÃO é suficiente
 * para produção em backend.
 *
 * Ao migrar para backend, substituir por hashing com algoritmo adequado:
 * - Argon2id (recomendado)
 * - bcrypt
 * - scrypt
 *
 * O backend nunca deve receber a senha em texto puro via esta camada.
 */

const SALT_BYTES = 16;

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === expectedHash;
}

export async function createPasswordRecord(
  password: string,
): Promise<{ passwordHash: string; passwordSalt: string }> {
  const passwordSalt = generateSalt();
  const passwordHash = await hashPassword(password, passwordSalt);
  return { passwordHash, passwordSalt };
}
