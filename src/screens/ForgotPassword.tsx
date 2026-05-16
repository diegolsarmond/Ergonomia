import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { authApi } from '../services/api';
import logoImg from '../assets/images/logo_1.png';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Preencha o e-mail.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
    } catch {
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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

          {submitted ? (
            /* Tela de confirmação */
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mx-auto">
                <Mail size={24} className="text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Verifique seu e-mail</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição de senha. Verifique também a caixa de spam.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-2 text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                <ArrowLeft size={14} />
                Voltar ao login
              </Link>
            </div>
          ) : (
            /* Formulário */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Esqueceu a senha?</h2>
                <p className="text-sm text-slate-400">
                  Informe seu e-mail cadastrado e enviaremos um link para redefinição.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                    placeholder="seu@email.com"
                  />
                </div>

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
                      Enviando...
                    </>
                  ) : (
                    'Enviar instruções'
                  )}
                </button>

                <div className="text-center pt-1">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    <ArrowLeft size={12} />
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
