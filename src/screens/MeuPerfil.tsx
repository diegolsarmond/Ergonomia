import React, { useState } from 'react';
import { User, KeyRound, Save, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TECHNICAL_RESPONSIBLE: 'Resp. Técnico',
  CONSULTANT: 'Consultor',
  CLIENT_VIEWER: 'Visualizador',
};

type Toast = { type: 'success' | 'error'; message: string };

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const isSuccess = toast.type === 'success';
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-6 ${
        isSuccess ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      {isSuccess ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
  );
}

function PasswordInput({
  id, label, value, onChange, placeholder,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export const MeuPerfil: React.FC = () => {
  const { currentUser } = useAuth();

  // ── Dados do perfil ──────────────────────────────────────────────────────────
  const [nome, setNome] = useState(currentUser?.name ?? '');
  const [formacao, setFormacao] = useState(currentUser?.formation ?? '');
  const [crefito, setCrefito] = useState(currentUser?.crefito ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState<Toast | null>(null);

  // ── Troca de senha ───────────────────────────────────────────────────────────
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordToast, setPasswordToast] = useState<Toast | null>(null);

  if (!currentUser) return null;

  const roleLabel = ROLE_LABELS[currentUser.role] ?? currentUser.role;

  // ── Salvar perfil ────────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim().length < 2) {
      setProfileToast({ type: 'error', message: 'O nome deve ter no mínimo 2 caracteres.' });
      return;
    }
    setSavingProfile(true);
    setProfileToast(null);
    try {
      await authApi.updateProfile({ nome: nome.trim(), formacao: formacao.trim(), crefito: crefito.trim() });
      setProfileToast({ type: 'success', message: 'Dados atualizados com sucesso.' });
    } catch (err: any) {
      setProfileToast({ type: 'error', message: err?.message ?? 'Erro ao salvar dados.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Trocar senha ─────────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senhaAtual) {
      setPasswordToast({ type: 'error', message: 'Informe a senha atual.' });
      return;
    }
    if (novaSenha.length < 6) {
      setPasswordToast({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setPasswordToast({ type: 'error', message: 'A confirmação não confere com a nova senha.' });
      return;
    }
    setSavingPassword(true);
    setPasswordToast(null);
    try {
      await authApi.changePassword(senhaAtual, novaSenha);
      setPasswordToast({ type: 'success', message: 'Senha alterada com sucesso.' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      setPasswordToast({ type: 'error', message: err?.message ?? 'Erro ao alterar senha.' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
          <p className="text-sm text-slate-500">{roleLabel} &middot; @{currentUser.username}</p>
        </div>
      </div>

      {/* Card: Dados pessoais */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-700">Dados pessoais</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="px-6 py-5 space-y-4">
          {profileToast && <ToastBanner toast={profileToast} onClose={() => setProfileToast(null)} />}

          {/* Campos somente leitura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Usuário</label>
              <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 select-none">
                {currentUser.username}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">E-mail</label>
              <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 select-none">
                {currentUser.email}
              </div>
            </div>
          </div>

          {/* Campos editáveis */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="formacao" className="block text-sm font-medium text-slate-700 mb-1">Formação</label>
              <input
                id="formacao"
                type="text"
                value={formacao}
                onChange={e => setFormacao(e.target.value)}
                placeholder="Ex: Fisioterapeuta"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="crefito" className="block text-sm font-medium text-slate-700 mb-1">Registro profissional</label>
              <input
                id="crefito"
                type="text"
                value={crefito}
                onChange={e => setCrefito(e.target.value)}
                placeholder="Ex: CREFITO-3/12345-F"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Salvando…' : 'Salvar dados'}
            </button>
          </div>
        </form>
      </div>

      {/* Card: Alterar senha */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-semibold text-slate-700">Alterar senha</h2>
        </div>
        <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
          {passwordToast && <ToastBanner toast={passwordToast} onClose={() => setPasswordToast(null)} />}

          <PasswordInput
            id="senha-atual"
            label="Senha atual"
            value={senhaAtual}
            onChange={setSenhaAtual}
            placeholder="Digite sua senha atual"
          />
          <PasswordInput
            id="nova-senha"
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            placeholder="Mínimo 6 caracteres"
          />
          <PasswordInput
            id="confirmar-senha"
            label="Confirmar nova senha"
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            placeholder="Repita a nova senha"
          />

          {/* Indicador de força */}
          {novaSenha.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      novaSenha.length >= n * 3
                        ? novaSenha.length >= 12 ? 'bg-emerald-500'
                          : novaSenha.length >= 8 ? 'bg-teal-500'
                          : 'bg-amber-400'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                {novaSenha.length < 6 ? 'Muito curta'
                  : novaSenha.length < 8 ? 'Fraca'
                  : novaSenha.length < 12 ? 'Média'
                  : 'Forte'}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              {savingPassword ? 'Alterando…' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
