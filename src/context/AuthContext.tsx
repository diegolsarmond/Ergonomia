import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AppUser, AuthSession, Permission, UserRole } from '../domain/auth/authTypes';
import { SESSION_DURATION_HOURS } from '../domain/auth/authDefaults';
import {
  getRolePermissions,
  type RolePermissionsMap,
} from '../domain/auth/rolePermissionRepository';
import { ROLE_PERMISSIONS } from '../domain/auth/permissions';
import { authApi, getToken, setToken, clearToken } from '../services/api';

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  currentUser: AppUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  rolePermissions: RolePermissionsMap;
  login(username: string, password: string): Promise<{ ok: boolean; error?: string }>;
  logout(): Promise<void>;
  refreshRolePermissions(): Promise<void>;
  hasPermission(permission: Permission): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(ROLE_PERMISSIONS);

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const perms = await getRolePermissions();
      setRolePermissions(perms);

      if (getToken()) {
        try {
          const user = await authApi.me();
          if (user.status === 'active') {
            setSession(buildSession(user));
            setCurrentUser(user);
          } else {
            clearToken();
          }
        } catch {
          clearToken();
        }
      }

      setLoading(false);
    })();
  }, []);

  // ── Refresh role permissions (call after saving changes) ────────────────────

  const refreshRolePermissions = useCallback(async () => {
    setRolePermissions(await getRolePermissions());
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────

  const login = useCallback(async (
    username: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { token, user } = await authApi.login(username, password);
      setToken(token);
      const newSession = buildSession(user);
      setSession(newSession);
      setCurrentUser(user);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message ?? 'Usuário ou senha inválidos.' };
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    clearToken();
    setSession(null);
    setCurrentUser(null);
  }, []);

  // ── Permission helpers — usa o mapa dinâmico do perfil do usuário ───────────

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!currentUser) return false;
      if ((currentUser.permissions as string[]).includes('ALL')) return true;
      return currentUser.permissions.includes(permission);
    },
    [currentUser],
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!currentUser) return false;
      if ((currentUser.permissions as string[]).includes('ALL')) return true;
      return permissions.some(p => currentUser.permissions.includes(p));
    },
    [currentUser],
  );

  // ── Value ───────────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    currentUser,
    session,
    loading,
    isAuthenticated: currentUser !== null && session !== null,
    rolePermissions,
    login,
    logout,
    refreshRolePermissions,
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
