import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Check, Save, Lock, AlertCircle, Plus, Trash2, X } from 'lucide-react';
import type { CustomProfile, Permission } from '../domain/auth/authTypes';
import {
  getCustomProfiles,
  saveCustomProfile,
  deleteCustomProfile,
} from '../domain/auth/rolePermissionRepository';
import { ADMIN_PERMISSIONS } from '../domain/auth/permissions';
import { useAuth } from '../context/AuthContext';

// â”€â”€ Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.permissions);

// â”€â”€ New Profile Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface NewProfileModalProps {
  onClose: () => void;
  onCreated: (profile: CustomProfile) => void;
}

function NewProfileModal({ onClose, onCreated }: NewProfileModalProps) {
  const [label, setLabel] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggle = (p: Permission) =>
    setPermissions(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p],
    );

  const handleCreate = async () => {
    if (!label.trim()) { setError('Informe um nome para o perfil.'); return; }
    const id = uuidv4();
    const profile: CustomProfile = { id, label: label.trim(), permissions };
    await saveCustomProfile(profile);
    onCreated(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Novo Perfil</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Nome do perfil <span className="text-red-500">*</span>
            </label>
            <input
              value={label}
              onChange={e => { setLabel(e.target.value); setError(null); }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Ex: Consultor, Visualizador..."
              autoFocus
            />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Permissões</p>
            <div className="space-y-3">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {group.permissions.map(p => (
                      <label key={p} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-800">
                        <input
                          type="checkbox"
                          checked={permissions.includes(p)}
                          onChange={() => toggle(p)}
                          className="rounded accent-teal-600"
                        />
                        {PERMISSION_LABELS[p]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => setPermissions(ALL_PERMISSIONS)}
            className="text-xs text-teal-600 hover:underline"
          >
            Marcar todas
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 text-sm rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Criar perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ProfilesPermissions() {
  const { refreshRolePermissions } = useAuth();
  const [customProfiles, setCustomProfiles] = useState<CustomProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // profile id being saved
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CustomProfile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setCustomProfiles(await getCustomProfiles());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePermission = (profileId: string, permission: Permission) => {
    setCustomProfiles(prev =>
      prev.map(p => {
        if (p.id !== profileId) return p;
        const perms = p.permissions.includes(permission)
          ? p.permissions.filter(x => x !== permission)
          : [...p.permissions, permission];
        return { ...p, permissions: perms };
      }),
    );
    setSaved(null);
  };

  const handleSave = async (profile: CustomProfile) => {
    setSaving(profile.id);
    setError(null);
    try {
      await saveCustomProfile(profile);
      await refreshRolePermissions();
      setSaved(profile.id);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (profile: CustomProfile) => {
    try {
      await deleteCustomProfile(profile.id);
      await refreshRolePermissions();
      setCustomProfiles(prev => prev.filter(p => p.id !== profile.id));
      setConfirmDelete(null);
    } catch {
      setError('Erro ao excluir. Tente novamente.');
    }
  };

  const handleCreated = async (profile: CustomProfile) => {
    await refreshRolePermissions();
    setCustomProfiles(prev => [...prev, profile]);
    setShowNewModal(false);
  };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Perfis e Permissões</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Crie perfis de acesso e configure suas permissões. O perfil
            <strong className="text-amber-600"> Administrador</strong> é fixo e sempre possui acesso total.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-500 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Novo Perfil
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ADMIN card — always first, locked */}
      <div className="mb-6 bg-amber-50/40 border border-amber-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-semibold text-slate-800">Administrador</p>
          <span className="ml-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700">fixo</span>
        </div>
        <p className="text-xs text-slate-500">Acesso total ao sistema. Não pode ser editado.</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {ADMIN_PERMISSIONS.map(p => (
            <span key={p} className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700 font-medium">
              {PERMISSION_LABELS[p]}
            </span>
          ))}
        </div>
      </div>

      {/* Custom profiles */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
        </div>
      ) : customProfiles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">Nenhum perfil customizado criado.</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="mt-3 text-sm text-teal-600 hover:underline"
          >
            + Criar primeiro perfil
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {customProfiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Profile header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{profile.label}</p>
                  <p className="text-[10px] font-mono text-slate-400">{profile.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {saved === profile.id && (
                    <span className="flex items-center gap-1 text-xs text-teal-600">
                      <Check className="w-3.5 h-3.5" /> Salvo
                    </span>
                  )}
                  <button
                    onClick={() => handleSave(profile)}
                    disabled={saving === profile.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-60 transition-colors"
                  >
                    {saving === profile.id
                      ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Save className="w-3.5 h-3.5" />}
                    Salvar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(profile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                </div>
              </div>

              {/* Permissions grid */}
              <div className="px-5 py-4">
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{group.label}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                        {group.permissions.map(p => {
                          const granted = profile.permissions.includes(p);
                          return (
                            <label key={p} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                              <button
                                type="button"
                                onClick={() => togglePermission(profile.id, p)}
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 transition-colors ${
                                  granted ? 'bg-teal-100 hover:bg-teal-200' : 'bg-slate-100 hover:bg-slate-200'
                                }`}
                              >
                                {granted && <Check className="w-3 h-3 text-teal-600" strokeWidth={2.5} />}
                              </button>
                              {PERMISSION_LABELS[p]}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Profile Modal */}
      {showNewModal && (
        <NewProfileModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Excluir perfil</h3>
                <p className="text-sm text-slate-500">
                  Excluir <strong>{confirmDelete.label}</strong>? Usuários com este perfil perderão as permissões associadas.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
