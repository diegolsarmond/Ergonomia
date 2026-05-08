import React from 'react';
import type { Permission } from '../../domain/auth/authTypes';
import { useAuth } from '../../context/AuthContext';

interface Props {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: Props) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
