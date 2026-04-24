import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FileText, Home, Settings } from 'lucide-react';

export const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 print:block print:h-auto print:bg-white">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center gap-2 text-teal-700">
            <FileText className="w-6 h-6" />
            AET System
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors">
            <Home className="w-5 h-5" />
            Projetos
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto print:overflow-visible">
        <Outlet />
      </main>
    </div>
  );
};
