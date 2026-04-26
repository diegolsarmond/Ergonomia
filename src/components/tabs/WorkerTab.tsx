import React from 'react';
import { FormGroup, Input, Textarea } from '../ui/Forms';
import { AETFunction } from '../../types';

interface Props { d: AETFunction; c: (f: keyof AETFunction, v: any) => void; }

export const WorkerTab: React.FC<Props> = ({ d, c }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormGroup label="Formação / Qualificação"><Input value={d.collabFormation} onChange={e => c('collabFormation', e.target.value)} /></FormGroup>
      <FormGroup label="Turno Entrevistado"><Input value={d.collabTurn} onChange={e => c('collabTurn', e.target.value)} /></FormGroup>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <FormGroup label="Gênero"><Input value={d.opinionGender} onChange={e => c('opinionGender', e.target.value)} /></FormGroup>
      <FormGroup label="Faixa Etária"><Input value={d.opinionAge} onChange={e => c('opinionAge', e.target.value)} /></FormGroup>
      <FormGroup label="Tempo Médio na Empresa"><Input value={d.opinionTime} onChange={e => c('opinionTime', e.target.value)} /></FormGroup>
    </div>
    <FormGroup label="Objetivo do Trabalho"><Input value={d.opinionObjective} onChange={e => c('opinionObjective', e.target.value)} /></FormGroup>
    <h3 className="text-sm font-semibold text-gray-700 pt-4 border-t">Percepção Ambiental</h3>
    <div className="grid grid-cols-2 gap-4">
      <FormGroup label="Sensação Térmica"><Input value={d.opinionThermal} onChange={e => c('opinionThermal', e.target.value)} /></FormGroup>
      <FormGroup label="Ventilação"><Input value={d.opinionVentilation} onChange={e => c('opinionVentilation', e.target.value)} /></FormGroup>
      <FormGroup label="Sensação de Iluminância"><Input value={d.opinionLightingSens} onChange={e => c('opinionLightingSens', e.target.value)} /></FormGroup>
      <FormGroup label="Sensação Acústica"><Input value={d.opinionAcoustics} onChange={e => c('opinionAcoustics', e.target.value)} /></FormGroup>
    </div>
    <FormGroup label="EPIs Utilizados"><Textarea value={d.opinionEPI} onChange={e => c('opinionEPI', e.target.value)} /></FormGroup>
    <h3 className="text-sm font-semibold text-gray-700 pt-4 border-t">Opinião do Trabalhador</h3>
    <FormGroup label="Equipamentos"><Textarea value={d.opinionEquip} onChange={e => c('opinionEquip', e.target.value)} /></FormGroup>
    <FormGroup label="Ciclo Operacional"><Textarea value={d.opinionCycle} onChange={e => c('opinionCycle', e.target.value)} /></FormGroup>
    <FormGroup label="Layout"><Textarea value={d.opinionLayout} onChange={e => c('opinionLayout', e.target.value)} /></FormGroup>
    <FormGroup label="Dificuldades na Tarefa"><Textarea value={d.opinionDifficulties} onChange={e => c('opinionDifficulties', e.target.value)} /></FormGroup>
    <FormGroup label="Pressão Temporal"><Input value={d.opinionPressure} onChange={e => c('opinionPressure', e.target.value)} /></FormGroup>
    <FormGroup label="Relacionamento entre Colegas"><Input value={d.opinionRelationship} onChange={e => c('opinionRelationship', e.target.value)} /></FormGroup>
    <FormGroup label="Abertura da Liderança"><Input value={d.opinionLeadership} onChange={e => c('opinionLeadership', e.target.value)} /></FormGroup>
    <FormGroup label="Influência da Manutenção"><Textarea value={d.opinionMaintenanceInfluence} onChange={e => c('opinionMaintenanceInfluence', e.target.value)} /></FormGroup>
    <FormGroup label="Intercorrências"><Textarea value={d.opinionIntercurrences} onChange={e => c('opinionIntercurrences', e.target.value)} /></FormGroup>
  </div>
);
