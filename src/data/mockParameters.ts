import { v4 as uuidv4 } from 'uuid';
import {
  Company, Unit, Sector, StandardJobRole, EPI, StandardEquipment,
  SurveyQuestion, StandardPause, RiskClassification, ReportTextTemplate,
  ScientificMethodTemplate, ChecklistQuestion
} from '../types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: uuidv4(),
    razaoSocial: 'Ergonomia Tech LTDA',
    nomeFantasia: 'ErgoTech',
    cnpj: '00.000.000/0001-00',
    address: 'Rua das Flores, 123',
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
    name: 'Desenvolvedor Frontend',
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
