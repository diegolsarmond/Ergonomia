import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FileText, Home, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Projetos' },
  { to: '/clients', icon: BookOpen, label: 'Clientes' },
];

export const Layout = () => {
  const location = useLocation();
  return (
    <div className="flex h-screen bg-gray-50 print:block print:h-auto print:bg-white">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden shrink-0">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-700 to-teal-600">
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <FileText className="w-6 h-6" />
            AET System
          </h1>
          <p className="text-teal-200 text-xs mt-1">Análise Ergonômica do Trabalho</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${active ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span>v2.0 — NR-17</span>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto print:overflow-visible">
        <Outlet />
      </main>
    </div>
  );
};
