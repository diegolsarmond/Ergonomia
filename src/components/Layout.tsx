import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, BookOpen, ChevronDown, ChevronRight, Settings,
  List, FlaskConical, Building2, Lightbulb,
  HardHat, Wrench, MessageSquare, Coffee, AlertTriangle, Menu, X, Clock, LogOut, Users, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/images/logo_3.png';

const PARAM_GROUPS = [
  {
    label: 'Cadastros',
    items: [
      { to: '/parameters/shifts', icon: Clock, label: 'Turnos' },
    ],
  },
  {
    label: 'Segurança',
    items: [
      { to: '/parameters/epis', icon: HardHat, label: 'EPIs' },
      { to: '/parameters/equipment', icon: Wrench, label: 'Equipamentos' },
      { to: '/parameters/pauses', icon: Coffee, label: 'Pausas Padrão' },
    ],
  },
  {
    label: 'Análise Ergonômica',
    items: [
      { to: '/parameters/survey-questions', icon: MessageSquare, label: 'Questionário do Trabalhador' },
      { to: '/parameters/checklist', icon: List, label: 'Checklist NHO 11' },
      { to: '/parameters/scientific-methods', icon: FlaskConical, label: 'Métodos Científicos' },
      { to: '/parameters/risk-classifications', icon: AlertTriangle, label: 'Classificação de Risco' },
      { to: '/parameters/biomechanical-risk-factors', icon: AlertTriangle, label: 'Fatores de Risco Biomecânicos' },
      { to: '/parameters/report-texts', icon: FileText, label: 'Textos Padrão' },
      { to: '/parameters/illuminance-norms', icon: Lightbulb, label: 'Parâmetros de Iluminância' },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TECHNICAL_RESPONSIBLE: 'Resp. Técnico',
  CONSULTANT: 'Consultor',
  CLIENT_VIEWER: 'Visualizador',
};

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission } = useAuth();
  const isParametros = location.pathname.startsWith('/parameters') && !location.pathname.startsWith('/parameters/companies');
  const isProjects = location.pathname === '/aep' || location.pathname === '/aet';
  const [parametrosOpen, setParametrosOpen] = useState(isParametros);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--color-surface)] print:block print:h-auto print:bg-white overflow-hidden">

      {/* ── Mobile Header ──────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-slate-900 text-white shadow-md z-40 print:hidden shrink-0">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Ergominas Logo" className="h-8 w-auto object-contain" />
          <h1 className="text-[14px] font-bold text-white tracking-tight leading-tight">ERGOMINAS<br/>Process</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 rounded-md hover:bg-slate-800 transition-colors">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile Overlay ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`sidebar fixed md:relative z-50 w-[260px] h-full flex flex-col print:hidden shrink-0 shadow-xl transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Ergominas Logo" className="h-9 w-auto object-contain" />
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">ERGOMINAS<br/>Process</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Projetos</p>
          <div className="space-y-0.5">
            <NavLink to="/aep" icon={FileText} label="Análise Preliminar - AEP" active={location.pathname === '/aep'} accent="amber" />
            <NavLink to="/aet" icon={BookOpen} label="Análise do Trabalho - AET" active={location.pathname === '/aet'} />
          </div>

          {(hasPermission('USERS_VIEW') || hasPermission('SETTINGS_VIEW') || hasPermission('CATALOG_VIEW')) && (
            <div className="mt-4">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Administração</p>
              {hasPermission('CATALOG_VIEW') && (
                <NavLink to="/parameters/companies" icon={Building2} label="Clientes" active={location.pathname.startsWith('/parameters/companies')} />
              )}
              {hasPermission('USERS_VIEW') && (
                <NavLink to="/users" icon={Users} label="Usuários" active={location.pathname === '/users'} />
              )}
              {(hasPermission('SETTINGS_VIEW') || hasPermission('USERS_VIEW')) && (
                <NavLink to="/profiles-permissions" icon={ShieldCheck} label="Perfis e Permissões" active={location.pathname === '/profiles-permissions'} />
              )}
            </div>
          )}

          {/* Parâmetros com submenu agrupado — visível apenas com CATALOG_VIEW */}
          {hasPermission('CATALOG_VIEW') && <div className="mt-5">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Configurações</p>
            <button
              onClick={() => setParametrosOpen((o: boolean) => !o)}
              className={`sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isParametros ? 'active text-teal-300' : 'text-slate-300 hover:text-white'}`}
            >
              <Settings className="w-[18px] h-[18px]" />
              <span className="flex-1 text-left">Parâmetros</span>
              {parametrosOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>

            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: parametrosOpen ? '600px' : '0px', opacity: parametrosOpen ? 1 : 0 }}
            >
              <div className="ml-4 mt-1 border-l border-slate-700 pl-3 space-y-3">
                {PARAM_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="px-3 text-[9px] font-semibold uppercase tracking-widest text-slate-600 mb-0.5 mt-2">
                      {group.label}
                    </p>
                    {group.items.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        active={location.pathname === item.to}
                        small
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5 space-y-3">
          {currentUser && (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-slate-300 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500">{ROLE_LABELS[currentUser.role] ?? currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-500 font-medium">v2.0 — NR-17</span>
          </div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto print:overflow-visible">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  small?: boolean;
  accent?: 'teal' | 'amber';
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, label, active, small, accent = 'teal' }) => (
  <Link
    to={to}
    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium ${small ? 'text-[13px]' : 'text-sm'
      } ${active
        ? accent === 'amber' ? 'active text-amber-300' : 'active text-teal-300'
        : 'text-slate-400 hover:text-white'
      }`}
  >
    <Icon className={small ? 'w-4 h-4' : 'w-[18px] h-[18px]'} />
    {label}
  </Link>
);
