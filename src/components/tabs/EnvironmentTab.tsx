import React from 'react';
import { FormGroup, Input, Textarea } from '../ui/Forms';
import { AETFunction } from '../../types';

interface Props { d: AETFunction; c: (f: keyof AETFunction, v: any) => void; }

export const EnvironmentTab: React.FC<Props> = ({ d, c }) => (
  <div className="space-y-4">
    <FormGroup label="Descrição dos Turnos"><Textarea value={d.shifts} onChange={e => c('shifts', e.target.value)} /></FormGroup>
    <FormGroup label="Horas Extras"><Input value={d.overtime} onChange={e => c('overtime', e.target.value)} /></FormGroup>
    <FormGroup label="Pausas Eletivas"><Textarea value={d.pauses} onChange={e => c('pauses', e.target.value)} /></FormGroup>
    <FormGroup label="Rodízio de Tarefas"><Input value={d.taskRotation} onChange={e => c('taskRotation', e.target.value)} /></FormGroup>
    <FormGroup label="Organograma de Hierarquia"><Textarea value={d.hierarchyOrganogram} onChange={e => c('hierarchyOrganogram', e.target.value)} /></FormGroup>
    <FormGroup label="Descrição do Local Analisado"><Textarea value={d.workspaceDescription} onChange={e => c('workspaceDescription', e.target.value)} /></FormGroup>
  </div>
);
