import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MOCK_CLIENTS } from '../data/mockClients';
import { Users } from 'lucide-react';

export const Clients = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">Gerenciamento de clientes cadastrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CLIENTS.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span className="truncate">{client.companyName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.fantasyName && <p className="text-xs text-teal-600 font-medium mb-2">{client.fantasyName}</p>}
              <p className="text-sm text-gray-600 mb-1">📋 CNPJ: {client.cnpj}</p>
              <p className="text-sm text-gray-600">📍 {client.address}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
