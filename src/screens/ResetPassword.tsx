import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import logoImg from '../assets/images/logo_1.png';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') ?? '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Link inválido. Solicite um novo link de redefinição de senha.');
    }
  }, [token]);

  function validate(): string | null {
    if (!novaSenha) return 'Preencha a nova senha.';
    if (novaSenha.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
    if (!confirmarSenha) return 'Confirme a nova senha.';
    if (novaSenha !== confirmarSenha) return 'As senhas não conferem.';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, novaSenha, confirmarSenha);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    if (!novaSenha) return null;
    if (novaSenha.length < 8) return { label: 'Fraca', color: 'bg-red-500', width: 'w-1/4' };
    if (novaSenha.length < 12) return { label: 'Razoável', color: 'bg-yellow-500', width: 'w-2/4' };
    if (/[A-Z]/.test(novaSenha) && /[0-9]/.test(novaSenha)) return { label: 'Forte', color: 'bg-teal-500', width: 'w-full' };
    return { label: 'Boa', color: 'bg-teal-400', width: 'w-3/4' };
  })();

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="ERGOMINAS Process" className="h-48 w-auto object-contain drop-shadow-xl" />
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">

          {success ? (
            /* Sucesso */
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Senha redefinida!</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                Ir para o login agora
              </Link>
            </div>
          ) : !token ? (
            /* Token ausente */
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Link inválido</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Este link de redefinição é inválido ou já foi utilizado.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : (
            /* Formulário */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Nova senha</h2>
                <p className="text-sm text-slate-400">
                  Crie uma nova senha para sua conta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Nova senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNova ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNova(v => !v)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showNova ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Indicador de força */}
                  {passwordStrength && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                      </div>
                      <p className="text-xs text-slate-500">Força: <span className="text-slate-300">{passwordStrength.label}</span></p>
                    </div>
                  )}
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmar ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                      placeholder="Repita a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(v => !v)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmarSenha && novaSenha !== confirmarSenha && (
                    <p className="mt-1 text-xs text-red-400">As senhas não conferem.</p>
                  )}
                </div>

                {/* Erro */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                    <p className="text-xs text-red-400 font-medium text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar nova senha'
                  )}
                </button>

                <div className="text-center pt-1">
                  <Link
                    to="/login"
                    className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Voltar ao login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
