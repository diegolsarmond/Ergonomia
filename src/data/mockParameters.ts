import { v4 as uuidv4 } from 'uuid';
import {
  Company, Unit, Sector, StandardJobRole, EPI, StandardEquipment,
  SurveyQuestion, StandardPause, RiskClassification, ReportTextTemplate,
  ScientificMethodTemplate, ChecklistQuestion, Shift
} from '../types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: uuidv4(),
    razaoSocial: 'Ergonomia Tech LTDA',
    nomeFantasia: 'ErgoTech',
    cnpj: '00.000.000/0001-00',
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    cep: '',
    product: 'Software',
    riskDegree: '1',
    logoDataUrl: '',
    active: true
  }
];

export const MOCK_UNITS: Unit[] = [
  {
    id: uuidv4(),
    companyId: '',
    name: 'Matriz SP',
    cep: '', logradouro: 'Av Paulista', numero: '1000', complemento: '', bairro: 'Bela Vista',
    city: 'São Paulo',
    uf: 'SP',
    address: 'Av Paulista, 1000',
    productionLocation: 'Escritório Central',
    logoDataUrl: ''
  }
];

export const MOCK_SECTORS: Sector[] = [
  {
    id: uuidv4(),
    companyId: '',
    unitId: '',
    name: 'Desenvolvimento',
    description: 'Equipe de dev',
    active: true
  }
];

export const MOCK_JOB_ROLES: StandardJobRole[] = [
  {
    id: uuidv4(),
    companyId: '',
    name: 'Desenvolvedor Frontend',
    sectorId: '', parentRoleId: '',
    cbo: '2122-05',
    description: 'Desenvolve interfaces web',
    active: true
  }
];

export const MOCK_EPIS: EPI[] = [
  {
    id: uuidv4(),
    name: 'Óculos de Proteção',
    type: 'Visual',
    description: 'Proteção contra impactos',
    mandatoryByDefault: false,
    active: true
  }
];

export const MOCK_EQUIPMENT: StandardEquipment[] = [
  {
    id: uuidv4(),
    name: 'Cadeira Ergonômica',
    category: 'Mobiliário',
    operation: ['manual'],
    description: 'Cadeira ajustável',
    hasDimensions: true,
    active: true
  }
];

export const MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: uuidv4(),
    question: 'Você sente dor ao final do expediente?',
    category: 'Saúde',
    responseType: 'Sim/Não',
    required: true,
    order: 1,
    active: true
  }
];

export const MOCK_PAUSES: StandardPause[] = [
  {
    id: uuidv4(),
    name: 'Pausa Visual',
    duration: '10',
    durationUnit: 'minutos',
    description: 'Descanso visual a cada 50 minutos',
    active: true
  }
];

export const MOCK_RISK_CLASSIFICATIONS: RiskClassification[] = [
  {
    id: uuidv4(),
    name: 'Risco Baixo',
    minScore: 0,
    maxScore: 2,
    color: '#22c55e',
    interpretation: 'Situação aceitável'
  }
];

export const MOCK_REPORT_TEXTS: ReportTextTemplate[] = [
  {
    id: uuidv4(),
    section: 'Introdução',
    title: 'Texto Padrão',
    text: 'Este é um texto padrão para introdução...',
    active: true
  }
];

export const MOCK_CHECKLIST_QUESTIONS: ChecklistQuestion[] = [
  {
    id: uuidv4(),
    text: 'A iluminação é adequada para a tarefa?',
    functionIds: []
  }
];

export const MOCK_SCIENTIFIC_METHODS: ScientificMethodTemplate[] = [
  {
    id: uuidv4(),
    name: 'RULA',
    description: 'Avaliação rápida de membros superiores',
    imageDataUrls: []
  }
];

export const MOCK_SHIFTS: Shift[] = [
  {
    id: uuidv4(),
    name: 'Turno diurno',
    description: 'Realizado durante o dia. Normalmente entre 6h e 18h. Exemplo: 8h às 17h.',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Turno noturno',
    description: 'Acontece à noite. Geralmente entre 22h e 5h (ou 6h). Pode ter regras específicas (como adicional noturno, dependendo da legislação).',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Turno vespertino',
    description: 'Período da tarde. Normalmente entre 12h e 18h. Exemplo: 13h às 19h.',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Turno rotativo (ou revezamento)',
    description: 'O trabalhador alterna entre turnos (dia/noite/tarde). Pode mudar semanalmente ou mensalmente.',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Turno fixo',
    description: 'Sempre no mesmo horário. Exemplo: sempre trabalhar só de manhã ou só à noite.',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Turno ininterrupto de revezamento',
    description: 'Usado em empresas que funcionam 24h (indústrias, hospitais). Equipes se alternam continuamente. No Brasil, costuma ter jornada reduzida (ex: 6h/dia).',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Escalas especiais',
    description: 'Algumas formas comuns: 12x36 → trabalha 12h, folga 36h; 6x1 → trabalha 6 dias, folga 1; 5x2 → trabalha 5 dias, folga 2 (padrão de escritório).',
    active: true
  }
];
