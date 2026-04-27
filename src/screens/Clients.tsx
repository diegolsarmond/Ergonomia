import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { MOCK_CLIENTS } from '../data/mockClients';
import { Users, Building, MapPin, Hash } from 'lucide-react';

export const Clients = () => {
  return (
    <div className="p-6 lg:p-8 xl:p-10">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-teal-200 text-sm mt-1">Gerenciamento de clientes cadastrados</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{MOCK_CLIENTS.length}</p>
              <p className="text-[11px] text-teal-200">cadastrados</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {MOCK_CLIENTS.map((client) => (
          <Card key={client.id} className="group">
            <CardContent className="!p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-teal-500/20 shrink-0">
                  {client.companyName?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 text-[15px] truncate">{client.companyName}</h3>
                  {client.fantasyName && <p className="text-xs text-teal-600 font-medium">{client.fantasyName}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>CNPJ: {client.cnpj}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{client.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
