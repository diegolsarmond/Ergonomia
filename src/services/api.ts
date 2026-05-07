/**
 * Cliente HTTP para comunicação com o servidor Express/PostgreSQL.
 * Substitui o LocalForage como camada de persistência.
 */

const BASE = '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
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
