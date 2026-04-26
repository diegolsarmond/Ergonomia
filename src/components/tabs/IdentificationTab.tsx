import React from 'react';
import { FormGroup, Input, Textarea, Select } from '../ui/Forms';
import { AETFunction } from '../../types';

interface Props { d: AETFunction; c: (f: keyof AETFunction, v: any) => void; }

export const IdentificationTab: React.FC<Props> = ({ d, c }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormGroup label="Nome da Função" required><Input value={d.name} onChange={e => c('name', e.target.value)} /></FormGroup>
      <FormGroup label="Nº de colaboradores" required><Input value={d.numEmployees} onChange={e => c('numEmployees', e.target.value)} /></FormGroup>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <FormGroup label="Unidade"><Input value={d.unit} onChange={e => c('unit', e.target.value)} /></FormGroup>
      <FormGroup label="Setor"><Input value={d.sector} onChange={e => c('sector', e.target.value)} /></FormGroup>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <FormGroup label="Data da Análise"><Input type="date" value={d.analysisDate} onChange={e => c('analysisDate', e.target.value)} /></FormGroup>
      <FormGroup label="Situação de Mercado"><Input value={d.marketSituation} onChange={e => c('marketSituation', e.target.value)} /></FormGroup>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <FormGroup label="Produto"><Input value={d.product} onChange={e => c('product', e.target.value)} /></FormGroup>
      <FormGroup label="Local de Produção"><Input value={d.productionLocation} onChange={e => c('productionLocation', e.target.value)} /></FormGroup>
    </div>
    <FormGroup label="Dimensão da Produção"><Textarea value={d.productionDimension} onChange={e => c('productionDimension', e.target.value)} /></FormGroup>
    <FormGroup label="Forma de Análise da Qualidade"><Textarea value={d.qualityAnalysis} onChange={e => c('qualityAnalysis', e.target.value)} /></FormGroup>
    <FormGroup label="Origem da Demanda"><Textarea value={d.demandOrigin} onChange={e => c('demandOrigin', e.target.value)} /></FormGroup>
    <FormGroup label="Objetivo da Análise"><Textarea value={d.objective} onChange={e => c('objective', e.target.value)} /></FormGroup>
    <FormGroup label="Demanda Encontrada"><Textarea value={d.demandFound} onChange={e => c('demandFound', e.target.value)} /></FormGroup>
  </div>
);
