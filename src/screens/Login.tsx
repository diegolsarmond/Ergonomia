import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/images/logo_1.png';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.ok) {
        navigate('/', { replace: true });
      } else {
        setError(result.error ?? 'Usuário ou senha inválidos.');
      }
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                placeholder="Digite seu usuário"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                placeholder="Digite sua senha"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-red-400 font-medium text-center">
                  {error}
                </p>
              </div>
            )}

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
