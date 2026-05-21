/**
 * Cliente HTTP para comunicação com o servidor Express/PostgreSQL.
 * Substitui o LocalForage como camada de persistência.
 */

import type { AppUser, CustomProfile, Permission, UserStatus } from '../domain/auth/authTypes';

const BASE = '/api';
const TOKEN_KEY = 'auth_token';

export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t: string): void { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken(): void { localStorage.removeItem(TOKEN_KEY); }

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const get  = <T>(path: string)                  => request<T>('GET',    path);
const post = <T>(path: string, body: unknown)   => request<T>('POST',   path, body);
const put  = <T>(path: string, body: unknown)   => request<T>('PUT',    path, body);
const del  = (path: string)                     => request<void>('DELETE', path);

// ── Mapeamento backend ↔ frontend ────────────────────────────────────────────

const STATUS_TO_FRONTEND: Record<string, UserStatus> = {
  ativo: 'active', inativo: 'inactive', bloqueado: 'blocked',
};
const STATUS_TO_BACKEND: Record<UserStatus, string> = {
  active: 'ativo', inactive: 'inativo', blocked: 'bloqueado',
};

function backendUserToApp(r: any): AppUser {
  return {
    id: r.id,
    name: r.nome,
    email: r.email,
    username: r.nomeUsuario,
    passwordHash: '',
    role: r.perfil,
    permissions: (r.permissions ?? []) as Permission[],
    status: STATUS_TO_FRONTEND[r.status] ?? 'active',
    mustChangePassword: r.alterarSenha ?? false,
    formation: r.formacao ?? '',
    crefito: r.crefito ?? '',
    createdAt: r.criadoEm ?? new Date().toISOString(),
    updatedAt: r.atualizadoEm ?? new Date().toISOString(),
    lastLoginAt: r.ultimoAcessoEm ?? undefined,
  };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (nomeUsuario: string, senha: string): Promise<{ token: string; user: AppUser }> => {
    const data = await post<{ token: string; user: any }>('/auth/login', { nomeUsuario, senha });
    return { token: data.token, user: backendUserToApp(data.user) };
  },
  me: async (): Promise<AppUser> => {
    const data = await get<any>('/auth/me');
    return backendUserToApp(data);
  },
  changePassword: (senhaAtual: string, novaSenha: string) =>
    post<{ message: string }>('/auth/change-password', { senhaAtual, novaSenha }),
  forgotPassword: (email: string) =>
    post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, novaSenha: string, confirmarSenha: string) =>
    post<{ message: string }>('/auth/reset-password', { token, novaSenha, confirmarSenha }),
};

// ── Usuários ─────────────────────────────────────────────────────────────────

export const usersApi = {
  list: async (): Promise<AppUser[]> => {
    const rows = await get<any[]>('/users');
    return rows.map(backendUserToApp);
  },
  create: (data: {
    nome: string; email: string; nomeUsuario: string; senha: string;
    perfil?: string; status?: string; formacao?: string; crefito?: string; alterarSenha?: boolean;
  }) => post<any>('/users', data),
  update: async (id: string, data: {
    nome?: string; email?: string; formacao?: string; crefito?: string;
    perfil?: string; status?: string; alterarSenha?: boolean;
  }): Promise<AppUser> => {
    const r = await put<any>(`/users/${id}`, data);
    return backendUserToApp(r);
  },
  delete: (id: string) => del(`/users/${id}`),
  resetPassword: (id: string, novaSenha: string) =>
    post<{ message: string }>(`/users/${id}/reset-password`, { novaSenha }),
};


// ── Perfis customizados ──────────────────────────────────────────────────────

function backendProfileToApp(r: any): CustomProfile {
  return { id: r.id, label: r.rotulo, permissions: r.permissoes as Permission[] };
}

export const profilesApi = {
  list: async (): Promise<CustomProfile[]> => {
    const rows = await get<any[]>('/users/profiles/list');
    return rows.map(backendProfileToApp);
  },
  create: async (label: string, permissions: Permission[]): Promise<CustomProfile> => {
    const r = await post<any>('/users/profiles/list', { rotulo: label, permissoes: permissions });
    return backendProfileToApp(r);
  },
  update: (id: string, label: string, permissions: Permission[]): Promise<void> =>
    put<void>(`/users/profiles/${id}`, { rotulo: label, permissoes: permissions }),
  delete: (id: string) => del(`/users/profiles/${id}`),
};

// ── Empresas ────────────────────────────────────────────────────────────────
export const companiesApi = {
  list:   ()           => get<any[]>('/companies'),
  create: (data: any)  => post<any>('/companies', data),
  update: (id: string, data: any) => put<any>(`/companies/${id}`, data),
  delete: (id: string) => del(`/companies/${id}`),
};

// ── Unidades ────────────────────────────────────────────────────────────────
export const unitsApi = {
  list:   ()           => get<any[]>('/units'),
  create: (data: any)  => post<any>('/units', data),
  update: (id: string, data: any) => put<any>(`/units/${id}`, data),
  delete: (id: string) => del(`/units/${id}`),
};

// ── Setores ─────────────────────────────────────────────────────────────────
export const sectorsApi = {
  list:   ()           => get<any[]>('/sectors'),
  create: (data: any)  => post<any>('/sectors', data),
  update: (id: string, data: any) => put<any>(`/sectors/${id}`, data),
  delete: (id: string) => del(`/sectors/${id}`),
};

// ── Cargos padrão ────────────────────────────────────────────────────────────
export const jobRolesApi = {
  list:   ()           => get<any[]>('/job-roles'),
  create: (data: any)  => post<any>('/job-roles', data),
  update: (id: string, data: any) => put<any>(`/job-roles/${id}`, data),
  delete: (id: string) => del(`/job-roles/${id}`),
};

// ── EPIs ────────────────────────────────────────────────────────────────────
export const episApi = {
  list:   ()           => get<any[]>('/epis'),
  create: (data: any)  => post<any>('/epis', data),
  update: (id: string, data: any) => put<any>(`/epis/${id}`, data),
  delete: (id: string) => del(`/epis/${id}`),
};

// ── Equipamentos ─────────────────────────────────────────────────────────────
export const equipmentApi = {
  list:   ()           => get<any[]>('/equipment'),
  create: (data: any)  => post<any>('/equipment', data),
  update: (id: string, data: any) => put<any>(`/equipment/${id}`, data),
  delete: (id: string) => del(`/equipment/${id}`),
};

// ── Perguntas entrevista ──────────────────────────────────────────────────────
export const surveyQuestionsApi = {
  list:   ()           => get<any[]>('/survey-questions'),
  create: (data: any)  => post<any>('/survey-questions', data),
  update: (id: string, data: any) => put<any>(`/survey-questions/${id}`, data),
  delete: (id: string) => del(`/survey-questions/${id}`),
};

// ── Pausas ───────────────────────────────────────────────────────────────────
export const pausesApi = {
  list:   ()           => get<any[]>('/pauses'),
  create: (data: any)  => post<any>('/pauses', data),
  update: (id: string, data: any) => put<any>(`/pauses/${id}`, data),
  delete: (id: string) => del(`/pauses/${id}`),
};

// ── Turnos ───────────────────────────────────────────────────────────────────
export const shiftsApi = {
  list:   ()           => get<any[]>('/shifts'),
  create: (data: any)  => post<any>('/shifts', data),
  update: (id: string, data: any) => put<any>(`/shifts/${id}`, data),
  delete: (id: string) => del(`/shifts/${id}`),
};

// ── Classificações de risco ──────────────────────────────────────────────────
export const riskClassificationsApi = {
  list:   ()           => get<any[]>('/risk-classifications'),
  create: (data: any)  => post<any>('/risk-classifications', data),
  update: (id: string, data: any) => put<any>(`/risk-classifications/${id}`, data),
  delete: (id: string) => del(`/risk-classifications/${id}`),
};

// ── Textos de relatório ───────────────────────────────────────────────────────
export const reportTextsApi = {
  list:   ()           => get<any[]>('/report-texts'),
  create: (data: any)  => post<any>('/report-texts', data),
  update: (id: string, data: any) => put<any>(`/report-texts/${id}`, data),
  delete: (id: string) => del(`/report-texts/${id}`),
};

// ── Métodos científicos ───────────────────────────────────────────────────────
export const scientificMethodsApi = {
  list:   ()           => get<any[]>('/scientific-methods'),
  create: (data: any)  => post<any>('/scientific-methods', data),
  update: (id: string, data: any) => put<any>(`/scientific-methods/${id}`, data),
  delete: (id: string) => del(`/scientific-methods/${id}`),
};

// ── Perguntas de checklist ────────────────────────────────────────────────────
export const checklistQuestionsApi = {
  list:   ()           => get<any[]>('/checklist-questions'),
  create: (data: any)  => post<any>('/checklist-questions', data),
  update: (id: string, data: any) => put<any>(`/checklist-questions/${id}`, data),
  delete: (id: string) => del(`/checklist-questions/${id}`),
};

// ── Fatores de risco biomecânico ──────────────────────────────────────────────
export const biomechanicalFactorsApi = {
  list:   ()           => get<any[]>('/biomechanical-factors'),
  create: (data: any)  => post<any>('/biomechanical-factors', data),
  update: (id: string, data: any) => put<any>(`/biomechanical-factors/${id}`, data),
  delete: (id: string) => del(`/biomechanical-factors/${id}`),
};

// ── Parâmetros normativos de iluminância ───────────────────────────────────────
export const illuminanceParamsApi = {
  list:   ()           => get<any[]>('/illuminance-params'),
  create: (data: any)  => post<any>('/illuminance-params', data),
  update: (id: string, data: any) => put<any>(`/illuminance-params/${id}`, data),
  delete: (id: string) => del(`/illuminance-params/${id}`),
};

// ── Projetos ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  list:   ()                          => get<any[]>('/projects'),
  save:   (project: any)              => post<any>('/projects', project),
  update: (id: string, project: any)  => put<any>(`/projects/${id}`, project),
  delete: (id: string)                => del(`/projects/${id}`),
};

// ── Clientes ─────────────────────────────────────────────────────────────────
export const clientsApi = {
  list:   ()           => get<any[]>('/clients'),
  save:   (client: any) => post<any>('/clients', client),
  update: (id: string, client: any) => put<any>(`/clients/${id}`, client),
  delete: (id: string) => del(`/clients/${id}`),
};

// ── Auditoria ─────────────────────────────────────────────────────────────────
export interface AuditoriaRow {
  id: number;
  data_hora: string;
  usuario_id: string | null;
  usuario_nome: string;
  acao: string;
  tabela: string;
  registro_id: string;
  descricao: string | null;
}

export interface AuditoriaListParams {
  tabela?: string;
  registroId?: string;
  usuarioId?: string;
  acao?: string;
  dataInicio?: string;
  dataFim?: string;
  limit?: number;
  offset?: number;
}

export const auditoriaApi = {
  list: (params?: AuditoriaListParams): Promise<{ rows: AuditoriaRow[]; total: number }> => {
    const qs = new URLSearchParams();
    if (params?.tabela)     qs.set('tabela',     params.tabela);
    if (params?.registroId) qs.set('registroId', params.registroId);
    if (params?.usuarioId)  qs.set('usuarioId',  params.usuarioId);
    if (params?.acao)       qs.set('acao',        params.acao);
    if (params?.dataInicio) qs.set('dataInicio',  params.dataInicio);
    if (params?.dataFim)    qs.set('dataFim',     params.dataFim);
    if (params?.limit != null)  qs.set('limit',  String(params.limit));
    if (params?.offset != null) qs.set('offset', String(params.offset));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return get<{ rows: AuditoriaRow[]; total: number }>(`/auditoria${query}`);
  },
  registrar: (acao: string, tabela: string, registroId: string, descricao: string): Promise<void> =>
    post<void>('/auditoria', { acao, tabela, registroId, descricao }),
};
