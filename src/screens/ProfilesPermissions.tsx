import React, { useCallback, useEffect, useState } from 'react';
import { Check, Save, RotateCcw, Lock, AlertCircle } from 'lucide-react';
import { ROLE_PERMISSIONS } from '../domain/auth/permissions';
import type { Permission, UserRole } from '../domain/auth/authTypes';
import {
  getRolePermissions,
  saveRolePermissions,
  resetRolePermissionsToDefault,
  type RolePermissionsMap,
} from '../domain/auth/rolePermissionRepository';
import { useAuth } from '../context/AuthContext';

// ── Metadata ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN:                'Administrador',
  TECHNICAL_RESPONSIBLE:'Resp. Técnico',
  CONSULTANT:           'Consultor',
  CLIENT_VIEWER:        'Visualizador',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN:                'Acesso total ao sistema',
  TECHNICAL_RESPONSIBLE:'Responsável técnico por avaliações e documentos',
  CONSULTANT:           'Consultor que cria e edita projetos',
  CLIENT_VIEWER:        'Cliente com acesso de visualização',
};

const PERMISSION_LABELS: Record<Permission, string> = {
  USERS_VIEW:    'Visualizar usuários',
  USERS_CREATE:  'Criar usuários',
  USERS_EDIT:    'Editar usuários',
  USERS_DELETE:  'Excluir usuários',

  PROJECTS_VIEW:   'Visualizar projetos',
  PROJECTS_CREATE: 'Criar projetos',
  PROJECTS_EDIT:   'Editar projetos',
  PROJECTS_DELETE: 'Excluir projetos',

  AEP_VIEW:   'Visualizar AEP',
  AEP_CREATE: 'Criar AEP',
  AEP_EDIT:   'Editar AEP',
  AEP_DELETE: 'Excluir AEP',
  AEP_PRINT:  'Imprimir / Gerar AEP',

  AET_VIEW:   'Visualizar AET',
  AET_CREATE: 'Criar AET',
  AET_EDIT:   'Editar AET',
  AET_DELETE: 'Excluir AET',
  AET_PRINT:  'Imprimir / Gerar AET',

  CATALOG_VIEW: 'Visualizar cadastros',
  CATALOG_EDIT: 'Editar cadastros',

  SETTINGS_VIEW: 'Visualizar configurações',
  SETTINGS_EDIT: 'Editar configurações',
};

interface PermissionGroup {
  label: string;
  permissions: Permission[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  { label: 'Usuários',       permissions: ['USERS_VIEW', 'USERS_CREATE', 'USERS_EDIT', 'USERS_DELETE'] },
  { label: 'Projetos',       permissions: ['PROJECTS_VIEW', 'PROJECTS_CREATE', 'PROJECTS_EDIT', 'PROJECTS_DELETE'] },
  { label: 'AEP',            permissions: ['AEP_VIEW', 'AEP_CREATE', 'AEP_EDIT', 'AEP_DELETE', 'AEP_PRINT'] },
  { label: 'AET',            permissions: ['AET_VIEW', 'AET_CREATE', 'AET_EDIT', 'AET_DELETE', 'AET_PRINT'] },
  { label: 'Cadastros',      permissions: ['CATALOG_VIEW', 'CATALOG_EDIT'] },
  { label: 'Configurações',  permissions: ['SETTINGS_VIEW', 'SETTINGS_EDIT'] },
];

const ROLES: UserRole[] = ['ADMIN', 'TECHNICAL_RESPONSIBLE', 'CONSULTANT', 'CLIENT_VIEWER'];
const EDITABLE_ROLES: UserRole[] = ['TECHNICAL_RESPONSIBLE', 'CONSULTANT', 'CLIENT_VIEWER'];

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfilesPermissions() {
  const { refreshRolePermissions } = useAuth();
  const [draft, setDraft] = useState<RolePermissionsMap>({ ...ROLE_PERMISSIONS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setDraft(await getRolePermissions());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (role: UserRole, permission: Permission) => {
    if (role === 'ADMIN') return; // ADMIN nunca editável
    setDraft(prev => {
      const current = prev[role];
      const next = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];
      return { ...prev, [role]: next };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveRolePermissions(draft);
      await refreshRolePermissions();
      setSaved(true);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setError(null);
    try {
      await resetRolePermissionsToDefault();
      await load();
      await refreshRolePermissions();
      setSaved(false);
    } catch {
      setError('Erro ao restaurar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Perfis e Permissões</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure quais permissões cada perfil de acesso possui.
            A coluna <strong>Administrador</strong> é bloqueada — sempre possui acesso total.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            disabled={saving || loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Restaurar padrão
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-60 transition-colors"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            Salvar alterações
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 text-sm">
          <Check className="w-4 h-4" /> Permissões salvas com sucesso.
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Profile description cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {ROLES.map(role => (
          <div key={role} className={`bg-white rounded-2xl border p-4 shadow-sm ${role === 'ADMIN' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm font-semibold text-slate-800">{ROLE_LABELS[role]}</p>
              {role === 'ADMIN' && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </div>
            <p className="text-xs text-slate-500 leading-snug">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>

      {/* Permissions table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-64">
                    Permissão
                  </th>
                  {ROLES.map(role => (
                    <th key={role} className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide ${role === 'ADMIN' ? 'text-amber-600' : 'text-slate-500'}`}>
                      <div className="flex items-center justify-center gap-1">
                        {ROLE_LABELS[role]}
                        {role === 'ADMIN' && <Lock className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group, gIdx) => (
                  <React.Fragment key={group.label}>
                    <tr className={`bg-slate-50/70 ${gIdx > 0 ? 'border-t border-slate-200' : ''}`}>
                      <td colSpan={ROLES.length + 1} className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        {group.label}
                      </td>
                    </tr>

                    {group.permissions.map(permission => (
                      <tr key={permission} className="border-t border-slate-100 hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-3 text-slate-700">
                          {PERMISSION_LABELS[permission]}
                          <span className="ml-2 text-[10px] font-mono text-slate-400">{permission}</span>
                        </td>
                        {ROLES.map(role => {
                          const granted = draft[role].includes(permission);
                          const isAdmin = role === 'ADMIN';
                          return (
                            <td key={role} className="px-4 py-3 text-center">
                              {isAdmin ? (
                                // ADMIN: sempre marcado, não clicável
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100" title="Administrador sempre possui esta permissão">
                                  <Check className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.5} />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggle(role, permission)}
                                  title={granted ? 'Remover permissão' : 'Conceder permissão'}
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                                    granted
                                      ? 'bg-teal-100 hover:bg-teal-200'
                                      : 'bg-slate-100 hover:bg-slate-200'
                                  }`}
                                >
                                  {granted && <Check className="w-3.5 h-3.5 text-teal-600" strokeWidth={2.5} />}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400">
            Alterações são salvas no armazenamento local e entram em vigor imediatamente.
            A coluna <span className="font-semibold text-amber-600">Administrador</span> não pode ser editada.
          </p>
        </div>
      </div>
    </div>
  );
}
