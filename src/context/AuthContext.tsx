import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { AppUser, AuthSession, Permission } from '../domain/auth/authTypes';
import {
  SESSION_STORAGE_KEY,
  SESSION_DURATION_HOURS,
} from '../domain/auth/authDefaults';
import {
  findUserByUsername,
  findUserById,
  updateUser,
  seedDevelopmentAdminUser,
} from '../domain/auth/userRepository';
import { verifyPassword } from '../domain/auth/passwordService';

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  currentUser: AppUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  login(username: string, password: string): Promise<{ ok: boolean; error?: string }>;
  logout(): Promise<void>;
  hasPermission(permission: Permission): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loadPersistedSession(): Promise<AuthSession | null> {
  const session = await localforage.getItem<AuthSession>(SESSION_STORAGE_KEY);
  if (!session) return null;
  if (new Date(session.expiresAt) <= new Date()) {
    await localforage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
  return session;
}

async function persistSession(session: AuthSession): Promise<void> {
  await localforage.setItem(SESSION_STORAGE_KEY, session);
}

async function clearSession(): Promise<void> {
  await localforage.removeItem(SESSION_STORAGE_KEY);
}

function buildSession(user: AppUser): AuthSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      if (import.meta.env.DEV) {
        await seedDevelopmentAdminUser();
      }

      const stored = await loadPersistedSession();
      if (stored) {
        const user = await findUserById(stored.userId);
        if (user && user.status === 'active') {
          setSession(stored);
          setCurrentUser(user);
        } else {
          await clearSession();
        }
      }

      setLoading(false);
    })();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────

  const login = useCallback(async (
    username: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    const GENERIC_ERROR = 'Usuário ou senha inválidos.';

    const user = await findUserByUsername(username);

    if (!user || user.status !== 'active') {
      return { ok: false, error: GENERIC_ERROR };
    }

    const valid = await verifyPassword(password, user.passwordSalt ?? '', user.passwordHash);
    if (!valid) {
      return { ok: false, error: GENERIC_ERROR };
    }

    const newSession = buildSession(user);
    await persistSession(newSession);
    await updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const refreshed = { ...user, lastLoginAt: newSession.createdAt };
    setSession(newSession);
    setCurrentUser(refreshed);

    return { ok: true };
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
    setCurrentUser(null);
  }, []);

  // ── Permission helpers ──────────────────────────────────────────────────────

  const hasPermission = useCallback(
    (permission: Permission) => currentUser?.permissions.includes(permission) ?? false,
    [currentUser],
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]) => permissions.some(p => currentUser?.permissions.includes(p) ?? false),
    [currentUser],
  );

  // ── Value ───────────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    currentUser,
    session,
    loading,
    isAuthenticated: currentUser !== null && session !== null,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return ctx;
}
