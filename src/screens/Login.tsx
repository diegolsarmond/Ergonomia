import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/images/logo_1.png';

const REMEMBER_KEY = 'ergominas_remember_user';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Preenche o usuário salvo ao montar
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setUsername(saved);
      setRememberUser(true);
    }
  }, []);

  function validate(): string | null {
    if (!username.trim()) return 'Preencha o usuário.';
    if (!password) return 'Preencha a senha.';
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
      const result = await login(username.trim(), password);
      if (result.ok) {
        if (rememberUser) {
          localStorage.setItem(REMEMBER_KEY, username.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
        navigate('/', { replace: true });
      } else {
        setError(result.error ?? 'Usuário ou senha inválidos.');
      }
    } catch {
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="ERGOMINAS Process" className="h-48 w-auto object-contain drop-shadow-xl" />
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 text-center tracking-tight">Acesso ao Sistema</h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Usuário */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                placeholder="Digite seu usuário"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Lembrar usuário + Esqueci senha */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberUser}
                  onChange={e => setRememberUser(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-white/20 bg-slate-800 accent-teal-500 cursor-pointer"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Lembrar usuário
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-red-400 font-medium text-center">{error}</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
