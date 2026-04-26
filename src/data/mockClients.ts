export interface Client {
  id: string;
  companyName: string;
  fantasyName: string;
  cnpj: string;
  address: string;
}

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    companyName: 'Tech Solutions Ltda',
    fantasyName: 'TechSol',
    cnpj: '12.345.678/0001-90',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
  },
  {
    id: '2',
    companyName: 'Indústria Metalúrgica ABC S.A.',
    fantasyName: 'Metal ABC',
    cnpj: '98.765.432/0001-10',
    address: 'Rua das Indústrias, 500 - Guarulhos, SP',
  },
  {
    id: '3',
    companyName: 'Comércio Varejista XYZ',
    fantasyName: 'Lojas XYZ',
    cnpj: '45.678.901/0001-23',
    address: 'Rua do Comércio, 123 - Campinas, SP',
  }
];
