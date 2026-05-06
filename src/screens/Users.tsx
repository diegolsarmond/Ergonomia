import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, KeyRound, AlertCircle, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import type { AppUser, UserRole, UserStatus } from '../domain/auth/authTypes';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../domain/auth/userRepository';
import { createPasswordRecord } from '../domain/auth/passwordService';
import { getRolePermissions } from '../domain/auth/rolePermissionRepository';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  TECHNICAL_RESPONSIBLE: 'Resp. Técnico',
  CONSULTANT: 'Consultor',
  CLIENT_VIEWER: 'Visualizador',
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
};

const STATUS_COLOR: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-500',
  blocked: 'bg-red-100 text-red-700',
};

// ── Form modal ────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  password: string;
  mustChangePassword: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  username: '',
  role: 'CONSULTANT',
  status: 'active',
  password: '',
  mustChangePassword: false,
};

interface ModalProps {
  editing: AppUser | null;
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ editing, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          name: editing.name,
          email: editing.email,
          username: editing.username,
          role: editing.role,
          status: editing.status,
          password: '',
          mustChangePassword: editing.mustChangePassword,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.username.trim()) {
      setError('Nome, e-mail e usuário são obrigatórios.');
      return;
    }
    if (!editing && !form.password) {
      setError('Informe a senha para o novo usuário.');
      return;
    }

    setSaving(true);
    try {
      const currentRolePerms = await getRolePermissions();
      if (editing) {
        const patch: Partial<AppUser> = {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          permissions: currentRolePerms[form.role],
          mustChangePassword: form.mustChangePassword,
        };
        if (form.password) {
          const { passwordHash, passwordSalt } = await createPasswordRecord(form.password);
          (patch as any).passwordHash = passwordHash;
          (patch as any).passwordSalt = passwordSalt;
        }
        await updateUser(editing.id, patch);
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          username: form.username,
          password: form.password,
          role: form.role,
          status: form.status,
          mustChangePassword: form.mustChangePassword,
        });
      }
      onSaved();
    } catch {
      setError('Erro ao salvar usuário. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {editing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <Field label="Nome completo" required>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className={INPUT_CLS}
              placeholder="Nome do usuário"
            />
          </Field>

          <Field label="E-mail" required>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={INPUT_CLS}
              placeholder="email@exemplo.com"
            />
          </Field>

          <Field label="Usuário" required>
            <input
              value={form.username}
              onChange={e => set('username', e.target.value)}
              className={INPUT_CLS}
              placeholder="login"
              disabled={!!editing}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Perfil">
              <select value={form.role} onChange={e => set('role', e.target.value as UserRole)} className={INPUT_CLS}>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value as UserStatus)} className={INPUT_CLS}>
                {(Object.keys(STATUS_LABELS) as UserStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={editing ? 'Nova senha (deixe em branco para manter)' : 'Senha'} required={!editing}>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              className={INPUT_CLS}
              placeholder={editing ? 'Nova senha (opcional)' : 'Senha inicial'}
              autoComplete="new-password"
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.mustChangePassword}
              onChange={e => set('mustChangePassword', e.target.checked)}
              className="rounded"
            />
            Exigir troca de senha no próximo acesso
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-xl bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-60 transition-colors flex items-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT_CLS = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function Users() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'new' | AppUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AppUser | null>(null);

  if (!hasPermission('USERS_VIEW')) {
    return <Navigate to="/" replace />;
  }

  const reload = useCallback(async () => {
    setLoading(true);
    setUsers(await getUsers());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleDelete = async (user: AppUser) => {
    await deleteUser(user.id);
    setConfirmDelete(null);
    reload();
  };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Usuários</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie os acessos ao sistema</p>
        </div>
        <PermissionGuard permission="USERS_CREATE">
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        </PermissionGuard>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">Nenhum usuário cadastrado.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Último acesso</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{user.username}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[user.status]}`}>
                      {STATUS_LABELS[user.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <PermissionGuard permission="USERS_EDIT">
                        <button
                          onClick={() => setModal(user)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="USERS_DELETE">
                        <button
                          onClick={() => setConfirmDelete(user)}
                          title="Excluir"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <UserModal
          editing={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); reload(); }}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Excluir usuário</h3>
                <p className="text-sm text-slate-500">
                  Tem certeza que deseja excluir <strong>{confirmDelete.name}</strong>?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
