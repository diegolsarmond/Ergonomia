export type UserStatus = 'active' | 'inactive' | 'blocked';

/** 'ADMIN' é o único perfil fixo do sistema. Qualquer outra string é um ID de perfil customizado. */
export type UserRole = 'ADMIN' | string;

export interface CustomProfile {
  id: string;
  label: string;
  permissions: Permission[];
}

export type Permission =
  | 'USERS_VIEW'
  | 'USERS_CREATE'
  | 'USERS_EDIT'
  | 'USERS_DELETE'
  | 'PROJECTS_VIEW'
  | 'PROJECTS_CREATE'
  | 'PROJECTS_EDIT'
  | 'PROJECTS_DELETE'
  | 'AEP_VIEW'
  | 'AEP_CREATE'
  | 'AEP_EDIT'
  | 'AEP_DELETE'
  | 'AEP_PRINT'
  | 'AET_VIEW'
  | 'AET_CREATE'
  | 'AET_EDIT'
  | 'AET_DELETE'
  | 'AET_PRINT'
  | 'CATALOG_VIEW'
  | 'CATALOG_EDIT'
  | 'SETTINGS_VIEW'
  | 'SETTINGS_EDIT';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  passwordSalt?: string;
  role: UserRole;
  permissions: Permission[];
  status: UserStatus;
  mustChangePassword: boolean;
  formation?: string;
  crefito?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  expiresAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
