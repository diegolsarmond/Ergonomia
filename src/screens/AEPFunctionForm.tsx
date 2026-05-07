import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input, Textarea, Select, Checkbox, Combobox } from '../components/ui/Forms';
import { Modal } from '../components/ui/Modal';
import { UnitModalForm, SectorModalForm, JobRoleModalForm, EMPTY_UNIT, EMPTY_SECTOR, EMPTY_ROLE } from '../components/SharedParameterModals';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, Camera } from 'lucide-react';
import { SingleImageUpload } from '../components/SingleImageUpload';
import { IlluminanceMeasurementPanel } from '../components/IlluminanceMeasurementPanel';
import type {
  AETFunction,
  AETProject,
  AEPFunctionAssessment,
  BiomechanicalItem,
  BiomechanicalAssessment,
  PsychosocialQuestion,
  AETTrigger,
  RACIAction,
  ScientificToolItem,
  PhotoRecord,
} from '../types';

// ── Constants ────────────────────────────────────────────────────────────────

const AEP_TABS = [
  '1. Identificação',
  '2. Caracterização',
  '3. Reg. Fotográfico',
  '4. Biomecânica',
  '5. Ferramentas',
  '6. Psicossocial',
  '7. Classif. de Risco',
  '8. Plano RACI',
];

const ASSESSMENT_OPTIONS: { value: BiomechanicalAssessment; label: string; color: string }[] = [
  { value: 'OK',       label: 'OK',      color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'Atenção',  label: 'Atenção', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'Crítico',  label: 'Crítico', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'N.A.',     label: 'N.A.',    color: 'bg-slate-100 text-slate-600 border-slate-300' },
];

const PSYCHOSOCIAL_SCALE = ['', '1', '2', '3', '4', '5'];

// ── CatalogMultiSelect ────────────────────────────────────────────────────────

interface CatalogItem { id: string; name: string; active: boolean; }

interface CatalogMultiSelectProps {
  label: string;
  items: CatalogItem[];
  value: string;          // comma-separated names
  onChange: (v: string) => void;
  onAddNew: (name: string) => Promise<void>;
  placeholder?: string;
}

const CatalogMultiSelect: React.FC<CatalogMultiSelectProps> = ({ label, items, value, onChange, onAddNew, placeholder }) => {
  const selected = value.split(', ').filter(Boolean);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeItems = items.filter(i => i.active);
  const filtered = activeItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (name: string) => {
    const cur = value.split(', ').filter(Boolean);
    const nxt = cur.includes(name) ? cur.filter(v => v !== name) : [...cur, name];
    onChange(nxt.join(', '));
  };

  const handleAddNew = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSaving(true);
    await onAddNew(trimmed);
    const cur = value.split(', ').filter(Boolean);
    onChange([...cur, trimmed].join(', '));
    setNewName('');
    setAddingNew(false);
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(name => (
            <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700 font-medium">
              {name}
              <button type="button" onClick={() => toggle(name)} className="hover:text-teal-900 leading-none">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setSearch(''); setAddingNew(false); }}
          className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-colors bg-white"
        >
          <span>{placeholder ?? `Selecionar ${label.toLowerCase()}...`}</span>
          <Plus className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute z-40 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* List */}
            <ul className="max-h-48 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-slate-400">Nenhum item encontrado.</li>
              )}
              {filtered.map(item => {
                const isSel = selected.includes(item.name);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.name)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${isSel ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-xs ${isSel ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300'}`}>
                        {isSel && '✓'}
                      </span>
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Add new */}
            <div className="border-t border-slate-100 p-2">
              {!addingNew ? (
                <button
                  type="button"
                  onClick={() => setAddingNew(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar novo e adicionar
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNew(); } if (e.key === 'Escape') setAddingNew(false); }}
                    placeholder="Nome do novo item..."
                    className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddNew}
                    disabled={saving || !newName.trim()}
                    className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-500 disabled:opacity-50 transition-colors"
                  >
                    {saving ? '...' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => setAddingNew(false)} className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="section-title first:!mt-0">{children}</div>
);

const ChipSelector = ({ label, value, options, onChange, placeholder }: { label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string }) => {
  const values = value.split(', ').filter(Boolean);
  return (
    <FormGroup label={label}>
      <div className="flex flex-wrap gap-2 mb-2">
        {options.map(opt => {
          const selected = values.includes(opt);
          return (
            <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              <Checkbox checked={selected} onChange={() => {
                const nxt = selected ? values.filter(v => v !== opt) : [...values, opt];
                onChange(nxt.join(', '));
              }} />
              {opt}
            </label>
          );
        })}
      </div>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </FormGroup>
  );
};

function computePsychosocialAverages(answers: PsychosocialQuestion[]) {
  const scored = answers.filter(a => a.score !== '');
  const scoreOf = (ids: string[]) => {
    const items = scored.filter(a => ids.includes(a.id));
    if (!items.length) return 0;
    const vals = items.map(a => {
      const raw = Number(a.score);
      return a.inverted ? (6 - raw) : raw;
    });
    return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100;
  };
  const demandRhythm                 = scoreOf(['psy-1', 'psy-2', 'psy-3']);
  const autonomyControl              = scoreOf(['psy-4', 'psy-5']);
  const roleClarityConflict          = scoreOf(['psy-6', 'psy-7']);
  const socialSupportLeadership      = scoreOf(['psy-8', 'psy-9', 'psy-10']);
  const recognitionJusticePsychSafety = scoreOf(['psy-11', 'psy-12', 'psy-13']);
  const allGroups = [demandRhythm, autonomyControl, roleClarityConflict, socialSupportLeadership, recognitionJusticePsychSafety].filter(v => v > 0);
  const overall = allGroups.length
    ? Math.round((allGroups.reduce((s, v) => s + v, 0) / allGroups.length) * 100) / 100
    : 0;

  // Classification
  const criticalIds = ['psy-1', 'psy-2', 'psy-10', 'psy-12'];
  const hasCritical4 = answers.some(a => criticalIds.includes(a.id) && Number(a.score) === 4 && !a.inverted);
  const highScoreCount = scored.filter(a => {
    const raw = Number(a.score);
    const v = a.inverted ? (6 - raw) : raw;
    return v >= 3;
  }).length;

  let classification: 'VERDE' | 'AMARELO' | 'VERMELHO' | '' = '';
  if (overall > 0) {
    if (overall >= 2.6 || highScoreCount >= 3 || hasCritical4) {
      classification = 'VERMELHO';
    } else if (overall >= 1.6 || (highScoreCount >= 1 && highScoreCount <= 2)) {
      classification = 'AMARELO';
    } else {
      classification = 'VERDE';
    }
  }

  const interpretations: Record<string, string> = {
    VERDE: 'Risco psicossocial baixo. Manter monitoramento periódico.',
    AMARELO: 'Risco psicossocial moderado. Recomenda-se atenção aos fatores identificados e ações preventivas.',
    VERMELHO: 'Risco psicossocial alto. Intervenção prioritária recomendada. Considerar indicação de AET.',
  };

  return {
    averages: { demandRhythm, autonomyControl, roleClarityConflict, socialSupportLeadership, recognitionJusticePsychSafety, overall },
    classification,
    interpretation: classification ? interpretations[classification] : '',
  };
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: AETProject;
  funcId: string;
  initialData: AETFunction;
  onSave: (data: AETFunction) => Promise<void>;
}

// ── Component ────────────────────────────────────────────────────────────────

export const AEPFunctionForm: React.FC<Props> = ({ project, funcId, initialData, onSave }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<AETFunction>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    companies, units, sectors, jobRoles,
    addJobRole, addUnit, addSector,
    shifts: shiftCatalog, pauses: pauseCatalog,
    scientificMethodTemplates,
    biomechanicalRiskFactors,
  } = useAET();

  const matchedCompany = companies.find(c =>
    (c.cnpj && project.cnpj && c.cnpj.replace(/\D/g, '') === project.cnpj.replace(/\D/g, '')) ||
    c.razaoSocial === project.companyName ||
    c.nomeFantasia === project.companyName
  );
  const companyUnits    = matchedCompany ? units.filter(u => u.companyId === matchedCompany.id) : [];
  const companySectors  = matchedCompany ? sectors.filter(s => s.companyId === matchedCompany.id) : [];
  const companyJobRoles = matchedCompany ? jobRoles.filter(r => r.companyId === matchedCompany.id) : [];

  const aep = formData.aep!;

  // ── Modals for creating new parameters ───────────────────────────────────
  const [createModal, setCreateModal] = useState<{ type: 'role' | 'unit' | 'sector'; open: boolean }>({ type: 'role', open: false });
  const [unitForm, setUnitForm] = useState({ ...EMPTY_UNIT, companyId: matchedCompany?.id || '' });
  const [sectorForm, setSectorForm] = useState({ ...EMPTY_SECTOR, companyId: matchedCompany?.id || '' });
  const [roleForm, setRoleForm] = useState({ ...EMPTY_ROLE, companyId: matchedCompany?.id || '' });

  const handleOpenCreateModal = (type: 'role' | 'unit' | 'sector') => {
    if (type === 'unit') setUnitForm({ ...EMPTY_UNIT, companyId: matchedCompany?.id || '' });
    if (type === 'sector') setSectorForm({ ...EMPTY_SECTOR, companyId: matchedCompany?.id || '' });
    if (type === 'role') setRoleForm({ ...EMPTY_ROLE, companyId: matchedCompany?.id || '' });
    setCreateModal({ type, open: true });
  };

  const handleSaveUnit = async () => {
    if (!unitForm.name.trim()) return;
    await addUnit({ ...unitForm, companyId: matchedCompany?.id || '' });
    setIdent('unitBranch', unitForm.name);
    setCreateModal({ ...createModal, open: false });
  };

  const handleSaveSector = async () => {
    if (!sectorForm.name.trim()) return;
    await addSector({ ...sectorForm, companyId: matchedCompany?.id || '' });
    setIdent('sectorArea', sectorForm.name);
    setCreateModal({ ...createModal, open: false });
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) return;
    await addJobRole({ ...roleForm, companyId: matchedCompany?.id || '' });
    setFormData(prev => ({ ...prev, name: roleForm.name }));
    setCreateModal({ ...createModal, open: false });
  };

  // ── setters ──────────────────────────────────────────────────────────────

  const setField = (field: keyof AETFunction, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const setAep = useCallback((updater: (prev: AEPFunctionAssessment) => AEPFunctionAssessment) =>
    setFormData(prev => ({ ...prev, aep: updater(prev.aep!) })), []);

  const setIdent = (field: keyof AEPFunctionAssessment['identification'], value: string) =>
    setAep(a => ({ ...a, identification: { ...a.identification, [field]: value } }));

  const setWork = (field: keyof AEPFunctionAssessment['workCharacterization'], value: any) =>
    setAep(a => ({ ...a, workCharacterization: { ...a.workCharacterization, [field]: value } }));

  const setWorkOrg = (field: keyof AEPFunctionAssessment['workCharacterization']['workOrganization'], value: string) =>
    setAep(a => ({
      ...a,
      workCharacterization: {
        ...a.workCharacterization,
        workOrganization: { ...a.workCharacterization.workOrganization, [field]: value },
      },
    }));

  const setTools = (field: keyof AEPFunctionAssessment['workCharacterization']['toolsAndMaterials'], value: string) =>
    setAep(a => ({
      ...a,
      workCharacterization: {
        ...a.workCharacterization,
        toolsAndMaterials: { ...a.workCharacterization.toolsAndMaterials, [field]: value },
      },
    }));

  const handleApplyJobRole = (roleId: string) => {
    const role   = companyJobRoles.find(r => r.id === roleId);
    if (!role) return;
    const sector = companySectors.find(s => s.id === role.sectorId);
    const unit   = sector ? companyUnits.find(u => u.id === sector.unitId) : null;
    // Pre-fill EPIs and equipment from the role's linked catalog items
    const roleEpiNames = (role.epiIds ?? [])
      .map(id => epiCatalog.find(e => e.id === id)?.name)
      .filter(Boolean) as string[];
    const roleEquipNames = (role.equipmentIds ?? [])
      .map(id => equipmentCatalog.find(e => e.id === id)?.name)
      .filter(Boolean) as string[];
    setFormData(prev => ({ ...prev, name: role.name }));
    if (sector) setIdent('sectorArea', sector.name);
    if (unit)   setIdent('unitBranch', unit.name);
    if (roleEpiNames.length > 0)   setTools('epis',        roleEpiNames.join(', '));
    if (roleEquipNames.length > 0) setTools('description', roleEquipNames.join(', '));
  };

  const setEnvComfort = (field: keyof AEPFunctionAssessment['biomechanics']['environmentalComfort'], value: string) =>
    setAep(a => ({
      ...a,
      biomechanics: {
        ...a.biomechanics,
        environmentalComfort: { ...a.biomechanics.environmentalComfort, [field]: value },
      },
    }));

  const updateBiomecItem = (
    group: keyof Omit<AEPFunctionAssessment['biomechanics'], 'environmentalComfort'>,
    idx: number,
    field: keyof BiomechanicalItem,
    value: any,
  ) =>
    setAep(a => {
      const list = [...(a.biomechanics[group] as BiomechanicalItem[])];
      (list[idx] as any)[field] = value;
      return { ...a, biomechanics: { ...a.biomechanics, [group]: list } };
    });

  const updatePsy = (idx: number, field: keyof PsychosocialQuestion, value: any) =>
    setAep(a => {
      const list = [...a.psychosocialAnswers];
      (list[idx] as any)[field] = value;
      const { averages, classification, interpretation } = computePsychosocialAverages(list);
      return {
        ...a,
        psychosocialAnswers: list,
        psychosocialAverages: averages,
        psychosocialClassification: classification,
        psychosocialInterpretation: interpretation,
      };
    });

  const updateTrigger = (idx: number, field: keyof AETTrigger, value: string) =>
    setAep(a => {
      const list = [...a.aetTriggers];
      (list[idx] as any)[field] = value;
      // auto-set requiresAET on the parent function
      const requiresAET = list.some(t => t.answer === 'Sim') || a.psychosocialClassification === 'VERMELHO';
      setFormData(prev => ({ ...prev, requiresAET }));
      return { ...a, aetTriggers: list };
    });

  // ── Scientific Tools ─────────────────────────────────────────────────────


  const updateTool = (idx: number, field: keyof ScientificToolItem, value: string) =>
    setAep(a => {
      const list = [...a.scientificTools];
      (list[idx] as any)[field] = value;
      return { ...a, scientificTools: list };
    });

  const removeTool = (idx: number) =>
    setAep(a => ({ ...a, scientificTools: a.scientificTools.filter((_, i) => i !== idx) }));

  // ── RACI ─────────────────────────────────────────────────────────────────

  const addRaci = () =>
    setAep(a => ({
      ...a,
      raciActionPlan: [
        ...a.raciActionPlan,
        { id: uuidv4(), riskFactor: '', action: '', responsible: '', accountable: '', consulted: '', informed: '', deadline: '', priority: '', status: '' },
      ],
    }));

  const updateRaci = (idx: number, field: keyof RACIAction, value: string) =>
    setAep(a => {
      const list = [...a.raciActionPlan];
      (list[idx] as any)[field] = value;
      return { ...a, raciActionPlan: list };
    });

  const removeRaci = (idx: number) =>
    setAep(a => ({ ...a, raciActionPlan: a.raciActionPlan.filter((_, i) => i !== idx) }));

  // ── Photos ───────────────────────────────────────────────────────────────

  const addPhoto = () =>
    setAep(a => ({
      ...a,
      photographicRecords: [...a.photographicRecords, { id: uuidv4(), imageDataUrl: '', description: '' }],
    }));

  const updatePhoto = (idx: number, field: keyof PhotoRecord, value: string) =>
    setAep(a => {
      const list = [...a.photographicRecords];
      (list[idx] as any)[field] = value;
      return { ...a, photographicRecords: list };
    });

  const removePhoto = (idx: number) =>
    setAep(a => ({ ...a, photographicRecords: a.photographicRecords.filter((_, i) => i !== idx) }));

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setError('O Nome da Função é obrigatório.');
      setActiveTab(0);
      return;
    }
    setSaving(true);
    try {
      setError(null);
      // sync legacy fields from aep data
      const synced: AETFunction = {
        ...formData,
        prescribedTask: formData.aep?.workCharacterization.processDescription || formData.prescribedTask,
        realTask:        formData.aep?.workCharacterization.workCycleDescription || formData.realTask,
        conclusion:      formData.aep?.decisionJustification || formData.conclusion,
        demandFound:     formData.aep?.identification.evaluatedActivity || formData.demandFound,
        requiresAET:     formData.requiresAET,
      };
      await onSave(synced);
    } catch {
      setError('Não foi possível salvar a função.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const classifColor: Record<string, string> = {
    VERDE:    'bg-green-100 text-green-800 border-green-300',
    AMARELO:  'bg-amber-100 text-amber-800 border-amber-300',
    VERMELHO: 'bg-red-100 text-red-800 border-red-300',
  };

  const priorityColor: Record<string, string> = {
    Baixa:   'text-green-700',
    Média:   'text-amber-700',
    Alta:    'text-orange-700',
    Crítica: 'text-red-700',
  };

  const renderBiomecGroup = (
    title: string,
    group: keyof Omit<AEPFunctionAssessment['biomechanics'], 'environmentalComfort'>,
  ) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2 border border-slate-200 font-medium text-slate-600 w-1/4">Fator Biomecânico</th>
              <th className="text-left p-2 border border-slate-200 font-medium text-slate-600 w-1/6">Avaliação</th>
              <th className="text-left p-2 border border-slate-200 font-medium text-slate-600 w-1/4">Fatores de Risco</th>
              <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">Descrição / Observação</th>
            </tr>
          </thead>
          <tbody>
            {(aep.biomechanics[group] as BiomechanicalItem[]).map((item, idx) => {
              const linkedRisks = biomechanicalRiskFactors.filter(rf => rf.active && rf.biomechanicalFactors?.includes(title));
              return (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2 border border-slate-200 text-slate-700 text-xs">{item.factor}</td>
                  <td className="p-2 border border-slate-200">
                    <select
                      value={item.assessment}
                      onChange={e => updateBiomecItem(group, idx, 'assessment', e.target.value)}
                      className={`w-full rounded-lg border px-2 py-1 text-[10px] font-medium ${
                        item.assessment ? classifColor[item.assessment] || 'border-slate-200' : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      <option value="">—</option>
                      {ASSESSMENT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 border border-slate-200">
                    <div className="space-y-1">
                      {linkedRisks.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">Nenhum fator vinculado</span>
                      ) : (
                        linkedRisks.map(rf => {
                          const isSelected = (item.selectedRiskFactors || []).includes(rf.id);
                          return (
                            <label key={rf.id} className="flex items-center gap-1.5 cursor-pointer group">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {
                                  const current = item.selectedRiskFactors || [];
                                  const next = isSelected ? current.filter(id => id !== rf.id) : [...current, rf.id];
                                  updateBiomecItem(group, idx, 'selectedRiskFactors', next);
                                }}
                              />
                              <span className={`text-[10px] transition-colors ${isSelected ? 'text-teal-700 font-medium' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                {rf.name}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="p-2 border border-slate-200">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateBiomecItem(group, idx, 'description', e.target.value)}
                      placeholder="Observação..."
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10px] focus:border-teal-500 focus:outline-none"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(`/project/${project.id}`)}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-800">
            {funcId === 'new' ? 'Nova Função AEP (v2.1)' : 'Editar Função AEP (v2.1)'}
          </h1>
          <p className="text-xs text-slate-500">{project.companyName}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="!bg-teal-600 !text-white hover:!bg-teal-700">
          <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {AEP_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === i
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="!p-6">

          {/* ── Tab 1: Identificação ── */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <SectionTitle>1. Identificação</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Nome da Função / Cargo" required>
                  <Select
                    className="w-full"
                    value={companyJobRoles.find(r => r.name === formData.name)?.id || (formData.name ? 'custom' : '')}
                    onChange={e => {
                      if (e.target.value === '__NEW__') {
                        handleOpenCreateModal('role');

                      } else if (e.target.value !== 'custom') {
                        const role = companyJobRoles.find(r => r.id === e.target.value);
                        if (role) handleApplyJobRole(role.id);
                      }
                    }}
                  >
                    <option value="">Selecione a função...</option>
                    {companyJobRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    {formData.name && !companyJobRoles.find(r => r.name === formData.name) && (
                      <option value="custom">{formData.name}</option>
                    )}
                    <option value="__NEW__" className="font-semibold text-teal-600">+ Criar novo...</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Código do Posto">
                  <Input value={aep.identification.code} onChange={e => setIdent('code', e.target.value)} />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Unidade / Filial">
                  <Select
                    className="w-full"
                    value={companyUnits.find(u => u.name === aep.identification.unitBranch)?.id || (aep.identification.unitBranch ? 'custom' : '')}
                    onChange={e => {
                      if (e.target.value === '__NEW__') {
                        handleOpenCreateModal('unit');

                      } else if (e.target.value !== 'custom') {
                        const u = companyUnits.find(x => x.id === e.target.value);
                        if (u) setIdent('unitBranch', u.name);
                      }
                    }}
                  >
                    <option value="">Selecione a unidade...</option>
                    {companyUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    {aep.identification.unitBranch && !companyUnits.find(u => u.name === aep.identification.unitBranch) && (
                      <option value="custom">{aep.identification.unitBranch}</option>
                    )}
                    <option value="__NEW__" className="font-semibold text-teal-600">+ Criar novo...</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Setor / Área">
                  <Select
                    className="w-full"
                    value={companySectors.find(s => s.name === aep.identification.sectorArea)?.id || (aep.identification.sectorArea ? 'custom' : '')}
                    onChange={e => {
                      if (e.target.value === '__NEW__') {
                        handleOpenCreateModal('sector');

                      } else if (e.target.value !== 'custom') {
                        const s = companySectors.find(x => x.id === e.target.value);
                        if (s) setIdent('sectorArea', s.name);
                      }
                    }}
                  >
                    <option value="">Selecione o setor...</option>
                    {companySectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {aep.identification.sectorArea && !companySectors.find(s => s.name === aep.identification.sectorArea) && (
                      <option value="custom">{aep.identification.sectorArea}</option>
                    )}
                    <option value="__NEW__" className="font-semibold text-teal-600">+ Criar novo...</option>
                  </Select>
                </FormGroup>
              </div>
              <FormGroup label="Funções Contempladas">
                <Input value={aep.identification.contemplatedFunctions} onChange={e => setIdent('contemplatedFunctions', e.target.value)} placeholder="Ex: Atendente de Balcão, Atendente de Caixa" />
              </FormGroup>
              <FormGroup label="Atividade Avaliada">
                <Textarea value={aep.identification.evaluatedActivity} onChange={e => setIdent('evaluatedActivity', e.target.value)} rows={3} placeholder="Descreva a atividade principal avaliada neste posto." />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Nº de Colaboradores" required>
                  <Input value={formData.numEmployees} onChange={e => setField('numEmployees', e.target.value)} />
                </FormGroup>
                <FormGroup label="Data da Análise">
                  <Input type="date" value={formData.analysisDate} onChange={e => setField('analysisDate', e.target.value)} />
                </FormGroup>
              </div>
            </div>
          )}

          {/* ── Tab 2: Caracterização do Trabalho ── */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <SectionTitle>2.1 Descrição do Processo e Ciclo de Trabalho</SectionTitle>
              <FormGroup label="Descrição">
                <Textarea value={aep.workCharacterization.processDescription} onChange={e => setWork('processDescription', e.target.value)} rows={6} placeholder="Descreva o processo produtivo e o ciclo de trabalho." />
              </FormGroup>

              <SectionTitle>2.2 Organização do Trabalho</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Jornada de Trabalho">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['6h/Dia', '8h/Dia', '12h/Dia'].map(opt => {
                      const selected = aep.workCharacterization.workOrganization.workday.split(', ').includes(opt);
                      return (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <Checkbox checked={selected} onChange={() => {
                            const cur = aep.workCharacterization.workOrganization.workday.split(', ').filter(Boolean);
                            const nxt = selected ? cur.filter(v => v !== opt) : [...cur, opt];
                            setWorkOrg('workday', nxt.join(', '));
                          }} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                  <Input
                    value={(() => {
                      const options = ['6h/Dia', '8h/Dia', '12h/Dia'];
                      return aep.workCharacterization.workOrganization.workday.split(', ').filter(v => v && !options.includes(v)).join(', ');
                    })()}
                    onChange={e => {
                      const options = ['6h/Dia', '8h/Dia', '12h/Dia'];
                      const fromOptions = aep.workCharacterization.workOrganization.workday.split(', ').filter(v => v && options.includes(v));
                      const extra = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setWorkOrg('workday', [...fromOptions, ...extra].join(', '));
                    }}
                    placeholder="Outra jornada..."
                  />
                </FormGroup>
                <FormGroup label="Escala / Turno">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {shiftCatalog.filter(s => s.active).map(s => {
                      const selected = aep.workCharacterization.workOrganization.scale.split(', ').includes(s.name);
                      return (
                        <label key={s.id} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <Checkbox checked={selected} onChange={() => {
                            const cur = aep.workCharacterization.workOrganization.scale.split(', ').filter(Boolean);
                            const nxt = selected ? cur.filter(v => v !== s.name) : [...cur, s.name];
                            setWorkOrg('scale', nxt.join(', '));
                          }} />
                          {s.name}
                        </label>
                      );
                    })}
                  </div>
                  <Input value={aep.workCharacterization.workOrganization.scale} onChange={e => setWorkOrg('scale', e.target.value)} placeholder="Ex: 6x1, 5x2, 12x36..." />
                </FormGroup>
                <FormGroup label="Horas Extras">
                  <Input value={aep.workCharacterization.workOrganization.overtime} onChange={e => setWorkOrg('overtime', e.target.value)} placeholder="Ex: Eventualmente" />
                </FormGroup>
                <FormGroup label="Pausa para o almoço">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['60min.', '15min.', 'N/A'].map(opt => {
                      const selected = aep.workCharacterization.workOrganization.lunchBreak.split(', ').includes(opt);
                      return (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <Checkbox checked={selected} onChange={() => {
                            const cur = aep.workCharacterization.workOrganization.lunchBreak.split(', ').filter(Boolean);
                            const nxt = selected ? cur.filter(v => v !== opt) : [...cur, opt];
                            setWorkOrg('lunchBreak', nxt.join(', '));
                          }} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                  <Input
                    value={(() => {
                      const options = ['60min.', '15min.', 'N/A'];
                      return aep.workCharacterization.workOrganization.lunchBreak.split(', ').filter(v => v && !options.includes(v)).join(', ');
                    })()}
                    onChange={e => {
                      const options = ['60min.', '15min.', 'N/A'];
                      const fromOptions = aep.workCharacterization.workOrganization.lunchBreak.split(', ').filter(v => v && options.includes(v));
                      const extra = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setWorkOrg('lunchBreak', [...fromOptions, ...extra].join(', '));
                    }}
                    placeholder="Outra pausa..."
                  />
                </FormGroup>
                <FormGroup label="Outras Pausas">
                  <Input value={aep.workCharacterization.workOrganization.otherBreaks} onChange={e => setWorkOrg('otherBreaks', e.target.value)} placeholder="Descreva outras pausas existentes..." />
                </FormGroup>
                <FormGroup label="Rodízio de Tarefas">
                  <Input value={aep.workCharacterization.workOrganization.taskRotation} onChange={e => setWorkOrg('taskRotation', e.target.value)} placeholder="Ex: Não há rodízio formalizado" />
                </FormGroup>
              </div>
              <FormGroup label="Diálogos de Segurança / DDS">
                <Input value={aep.workCharacterization.workOrganization.safetyDialogues} onChange={e => setWorkOrg('safetyDialogues', e.target.value)} placeholder="Ex: Semanal" />
              </FormGroup>

              <SectionTitle>2.3 Equipamentos e EPIs</SectionTitle>
              <FormGroup label="Equipamentos Utilizados">
                <CatalogMultiSelect
                  label="Equipamentos"
                  items={equipmentCatalog}
                  value={aep.workCharacterization.toolsAndMaterials.description}
                  onChange={v => setTools('description', v)}
                  onAddNew={async name => {
                    await addEquipment({ name, category: '', operation: [], description: '', hasDimensions: false, active: true });
                  }}
                  placeholder="Selecionar equipamentos do catálogo..."
                />
                <Input
                  className="mt-2"
                  value={(() => {
                    const catalogNames = equipmentCatalog.map(e => e.name);
                    return aep.workCharacterization.toolsAndMaterials.description
                      .split(', ').filter(n => n && !catalogNames.includes(n)).join(', ');
                  })()}
                  onChange={e => {
                    const catalogNames = equipmentCatalog.map(eq => eq.name);
                    const fromCatalog = aep.workCharacterization.toolsAndMaterials.description
                      .split(', ').filter(n => n && catalogNames.includes(n));
                    const extra = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setTools('description', [...fromCatalog, ...extra].join(', '));
                  }}
                  placeholder="Outros equipamentos (não cadastrados), separados por vírgula..."
                />
              </FormGroup>
              <FormGroup label="EPIs Utilizados">
                <CatalogMultiSelect
                  label="EPIs"
                  items={epiCatalog}
                  value={aep.workCharacterization.toolsAndMaterials.epis}
                  onChange={v => setTools('epis', v)}
                  onAddNew={async name => {
                    await addEPI({ name, type: '', description: '', mandatoryByDefault: false, active: true });
                  }}
                  placeholder="Selecionar EPIs do catálogo..."
                />
                <Input
                  className="mt-2"
                  value={(() => {
                    const catalogNames = epiCatalog.map(e => e.name);
                    return aep.workCharacterization.toolsAndMaterials.epis
                      .split(', ').filter(n => n && !catalogNames.includes(n)).join(', ');
                  })()}
                  onChange={e => {
                    const catalogNames = epiCatalog.map(ep => ep.name);
                    const fromCatalog = aep.workCharacterization.toolsAndMaterials.epis
                      .split(', ').filter(n => n && catalogNames.includes(n));
                    const extra = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setTools('epis', [...fromCatalog, ...extra].join(', '));
                  }}
                  placeholder="Outros EPIs (não cadastrados), separados por vírgula..."
                />
              </FormGroup>
              <FormGroup label="Outros Recursos">
                <Input value={aep.workCharacterization.toolsAndMaterials.others} onChange={e => setTools('others', e.target.value)} />
              </FormGroup>
            </div>
          )}

          {/* ── Tab 3: Registro Fotográfico ── */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <SectionTitle>3. Registro Fotográfico</SectionTitle>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                {aep.lgpdNote}
              </div>
              <Button variant="ghost" onClick={addPhoto} className="border border-dashed border-teal-400 text-teal-600 hover:bg-teal-50">
                <Camera className="w-4 h-4" /> Adicionar Foto
              </Button>
              {aep.photographicRecords.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhuma foto adicionada.</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {aep.photographicRecords.map((photo, idx) => (
                  <div key={photo.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600">Foto {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removePhoto(idx)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                    <SingleImageUpload
                      value={photo.imageDataUrl}
                      onChange={url => updatePhoto(idx, 'imageDataUrl', url)}
                      label="Imagem"
                    />
                    <input
                      type="text"
                      value={photo.description}
                      onChange={e => updatePhoto(idx, 'description', e.target.value)}
                      placeholder="Descrição da foto..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 4: Biomecânica ── */}
          {activeTab === 3 && (
            <div className="space-y-2">
              <SectionTitle>4. Biomecânica</SectionTitle>
              <p className="text-xs text-slate-500 mb-4">
                Avalie cada fator como: <span className="font-medium text-green-700">OK</span> · <span className="font-medium text-amber-700">Atenção</span> · <span className="font-medium text-red-700">Crítico</span> · <span className="font-medium text-slate-600">N.A.</span>
              </p>
              {renderBiomecGroup('Posturas e Alcances', 'postureAndReach')}
              {renderBiomecGroup('Repetitividade e Ritmo', 'repetitivenessAndRhythm')}
              {renderBiomecGroup('Força e Exigência Física', 'forceAndPhysicalDemand')}
              {renderBiomecGroup('Movimentação Manual de Cargas', 'manualMaterialHandling')}
              {renderBiomecGroup('Mobiliário e Posto de Trabalho', 'furnitureAndWorkstation')}

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">4.6 Conforto Ambiental</h4>
                <div className="grid grid-cols-1 gap-4">
                  {/* Iluminação */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Iluminação</p>
                    <div className="grid grid-cols-3 gap-3">
                      <FormGroup label="Queixa">
                        <select value={aep.biomechanics.environmentalComfort.lightingComplaint} onChange={e => setEnvComfort('lightingComplaint', e.target.value)} className="w-full rounded-xl border border-slate-200 p-2 text-sm bg-white focus:border-teal-500 focus:outline-none">
                          <option value="">—</option>
                          <option value="Sim">Sim</option>
                          <option value="Não">Não</option>
                        </select>
                      </FormGroup>
                      <FormGroup label="Valor Medido (lux)">
                        <Input value={aep.biomechanics.environmentalComfort.lightingValue} onChange={e => setEnvComfort('lightingValue', e.target.value)} placeholder="Ex: 480 lux" />
                      </FormGroup>
                      <FormGroup label="Descrição">
                        <Input value={aep.biomechanics.environmentalComfort.lightingDescription} onChange={e => setEnvComfort('lightingDescription', e.target.value)} />
                      </FormGroup>
                    </div>
                  </div>
                  {/* Ruído */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Ruído</p>
                    <div className="grid grid-cols-3 gap-3">
                      <FormGroup label="Queixa">
                        <select value={aep.biomechanics.environmentalComfort.noiseComplaint} onChange={e => setEnvComfort('noiseComplaint', e.target.value)} className="w-full rounded-xl border border-slate-200 p-2 text-sm bg-white focus:border-teal-500 focus:outline-none">
                          <option value="">—</option>
                          <option value="Sim">Sim</option>
                          <option value="Não">Não</option>
                        </select>
                      </FormGroup>
                      <FormGroup label="Valor Medido (dB)">
                        <Input value={aep.biomechanics.environmentalComfort.noiseValue} onChange={e => setEnvComfort('noiseValue', e.target.value)} placeholder="Ex: 72 dB" />
                      </FormGroup>
                      <FormGroup label="Descrição">
                        <Input value={aep.biomechanics.environmentalComfort.noiseDescription} onChange={e => setEnvComfort('noiseDescription', e.target.value)} />
                      </FormGroup>
                    </div>
                  </div>
                  {/* Temperatura */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Temperatura</p>
                    <div className="grid grid-cols-3 gap-3">
                      <FormGroup label="Queixa">
                        <select value={aep.biomechanics.environmentalComfort.temperatureComplaint} onChange={e => setEnvComfort('temperatureComplaint', e.target.value)} className="w-full rounded-xl border border-slate-200 p-2 text-sm bg-white focus:border-teal-500 focus:outline-none">
                          <option value="">—</option>
                          <option value="Sim">Sim</option>
                          <option value="Não">Não</option>
                        </select>
                      </FormGroup>
                      <FormGroup label="Valor Medido (°C)">
                        <Input value={aep.biomechanics.environmentalComfort.temperatureValue} onChange={e => setEnvComfort('temperatureValue', e.target.value)} placeholder="Ex: 29°C" />
                      </FormGroup>
                      <FormGroup label="Descrição">
                        <Input value={aep.biomechanics.environmentalComfort.temperatureDescription} onChange={e => setEnvComfort('temperatureDescription', e.target.value)} />
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 5: Ferramentas Científicas ── */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <SectionTitle>5. Ferramentas Científicas</SectionTitle>


              {aep.scientificTools.map((tool, idx) => (
                <div key={tool.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Ferramenta {idx + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeTool(idx)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                  <FormGroup label="Nome da Ferramenta / Método">
                    <datalist id={`methods-list-${idx}`}>
                      {scientificMethodTemplates.map(m => <option key={m.id} value={m.name} />)}
                    </datalist>
                    <input
                      list={`methods-list-${idx}`}
                      value={tool.toolName}
                      onChange={e => {
                        updateTool(idx, 'toolName', e.target.value);
                        const tpl = scientificMethodTemplates.find(m => m.name === e.target.value);
                        if (tpl) updateTool(idx, 'interpretation', tpl.description);
                      }}
                      placeholder="Ex: RULA, REBA, NIOSH..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Resultado">
                      <Input value={tool.result} onChange={e => updateTool(idx, 'result', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Interpretação">
                      <Input value={tool.interpretation} onChange={e => updateTool(idx, 'interpretation', e.target.value)} />
                    </FormGroup>
                  </div>
                  <FormGroup label="Recomendação">
                    <Textarea value={tool.recommendation} onChange={e => updateTool(idx, 'recommendation', e.target.value)} rows={2} />
                  </FormGroup>
                  <SingleImageUpload value={tool.imageDataUrl || ''} onChange={url => updateTool(idx, 'imageDataUrl', url)} label="Imagem do resultado" />
                </div>
              ))}

              {/* ── 5b. Medições de Iluminância ── */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <IlluminanceMeasurementPanel
                  measurements={aep.illuminanceMeasurements || []}
                  onChange={(measurements) => setAep(a => ({ ...a, illuminanceMeasurements: measurements }))}
                />
              </div>
            </div>
          )}

          {/* ── Tab 6: Psicossocial ── */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <SectionTitle>6. Avaliação Psicossocial</SectionTitle>
              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p>
                  Esta seção visa identificar fatores de risco psicossociais no ambiente de trabalho, conforme as diretrizes mais recentes da NR-17. As perguntas são baseadas em escalas de percepção. O objetivo é uma triagem para direcionamento de ações de gestão e saúde ocupacional, não um diagnóstico clínico.
                </p>
                <p>
                  <strong>Instrução:</strong> Por favor, avalie a frequência com que você experimentou as seguintes situações no seu trabalho nas últimas 4 semanas, utilizando a escala abaixo.
                </p>
                <div className="flex gap-2 items-start text-amber-800 bg-amber-100 p-3 rounded-lg border border-amber-300">
                  <span className="text-lg leading-none">⚠️</span>
                  <p className="font-medium text-xs leading-relaxed">
                    IMPORTANTE: Leia atentamente cada item. Algumas perguntas são positivas e outras negativas. Evite responder de forma automática; a escala muda de sentido conforme a frase.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium bg-white p-3 rounded-xl border border-slate-200">
                Escala: 1 = Nunca · 2 = Raramente · 3 = Às vezes · 4 = Frequentemente · 5 = Sempre
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">Grupo</th>
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">Fator Psicossocial</th>
                      <th className="text-center p-2 border border-slate-200 font-medium text-slate-600 w-24">Pontuação</th>
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600 w-40">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aep.psychosocialAnswers.map((q, idx) => (
                      <tr key={q.id} className={q.inverted ? 'bg-teal-50/30' : ''}>
                        <td className="p-2 border border-slate-200 text-xs text-slate-500">{q.group}</td>
                        <td className="p-2 border border-slate-200 text-slate-700">
                          {q.question}
                          {q.inverted && <span className="ml-1 text-[10px] text-teal-600 font-medium">(invertida)</span>}
                        </td>
                        <td className="p-2 border border-slate-200 text-center">
                          <select
                            value={q.score === '' ? '' : String(q.score)}
                            onChange={e => updatePsy(idx, 'score', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm text-center bg-white focus:border-teal-500 focus:outline-none"
                          >
                            {PSYCHOSOCIAL_SCALE.map(v => (
                              <option key={v} value={v}>{v || '—'}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border border-slate-200">
                          <input
                            type="text"
                            value={q.comments}
                            onChange={e => updatePsy(idx, 'comments', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Médias e Classificação */}
              {aep.psychosocialClassification && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Resultado Automático</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ['Demandas / Ritmo',                   aep.psychosocialAverages.demandRhythm],
                      ['Autonomia / Controle',               aep.psychosocialAverages.autonomyControl],
                      ['Clareza / Conflito de Papéis',       aep.psychosocialAverages.roleClarityConflict],
                      ['Apoio Social e Liderança',           aep.psychosocialAverages.socialSupportLeadership],
                      ['Reconhecimento / Segurança Psic.',   aep.psychosocialAverages.recognitionJusticePsychSafety],
                    ].map(([label, val]) => (
                      <div key={label as string} className="flex justify-between">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-semibold text-slate-800">{(val as number).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between col-span-2 pt-1 border-t border-slate-200">
                      <span className="font-semibold text-slate-700">Média Geral</span>
                      <span className="font-bold text-slate-900">{aep.psychosocialAverages.overall.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600">Classificação:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${classifColor[aep.psychosocialClassification] || ''}`}>
                      {aep.psychosocialClassification}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">{aep.psychosocialInterpretation}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 7: Classificação de Risco / Gatilhos AET ── */}
          {activeTab === 6 && (
            <div className="space-y-4">
              <SectionTitle>7. Classificação de Risco — Gatilhos para AET</SectionTitle>
              <p className="text-xs text-slate-500">Responda "Sim" para qualquer gatilho identificado. A presença de pelo menos um "Sim" sugere indicação de AET.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">#</th>
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">Gatilho</th>
                      <th className="text-center p-2 border border-slate-200 font-medium text-slate-600 w-24">Resposta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aep.aetTriggers.map((t, idx) => (
                      <tr key={t.id} className={t.answer === 'Sim' ? 'bg-red-50' : ''}>
                        <td className="p-2 border border-slate-200 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-2 border border-slate-200 text-slate-700">{t.description}</td>
                        <td className="p-2 border border-slate-200 text-center">
                          <select
                            value={t.answer}
                            onChange={e => updateTrigger(idx, 'answer', e.target.value)}
                            className={`w-full rounded-lg border px-2 py-1 text-xs font-medium bg-white focus:outline-none ${
                              t.answer === 'Sim' ? 'border-red-300 text-red-700' : t.answer === 'Não' ? 'border-green-300 text-green-700' : 'border-slate-200 text-slate-400'
                            }`}
                          >
                            <option value="">—</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Indicador automático */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-slate-600">Sugestão automática:</span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${formData.requiresAET ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {formData.requiresAET ? 'Requer AET' : 'Não requer AET'}
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={formData.requiresAET ?? false} onChange={e => setField('requiresAET', e.target.checked)} className="rounded" />
                  Editar manualmente
                </label>
              </div>

              <FormGroup label="Orientação Final">
                <Textarea value={aep.finalGuidance} onChange={e => setAep(a => ({ ...a, finalGuidance: e.target.value }))} rows={3} placeholder="Orientações gerais ao cliente após a avaliação preliminar." />
              </FormGroup>
              <FormGroup label="Justificativa da Decisão">
                <Textarea value={aep.decisionJustification} onChange={e => setAep(a => ({ ...a, decisionJustification: e.target.value }))} rows={3} placeholder="Justifique a decisão de indicar ou não a AET." />
              </FormGroup>
            </div>
          )}

          {/* ── Tab 8: Plano de Ação RACI ── */}
          {activeTab === 7 && (
            <div className="space-y-4">
              <SectionTitle>8. Plano de Ação RACI</SectionTitle>
              <Button variant="ghost" onClick={addRaci} className="border border-dashed border-teal-400 text-teal-600 hover:bg-teal-50">
                <Plus className="w-4 h-4" /> Adicionar Ação
              </Button>
              {aep.raciActionPlan.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhuma ação cadastrada.</p>
              )}
              {aep.raciActionPlan.map((action, idx) => (
                <div key={action.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Ação {idx + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeRaci(idx)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                  <FormGroup label="Fator de Risco">
                    <Input value={action.riskFactor} onChange={e => updateRaci(idx, 'riskFactor', e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Ação Proposta">
                    <Textarea value={action.action} onChange={e => updateRaci(idx, 'action', e.target.value)} rows={2} />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="R — Responsável">
                      <Input value={action.responsible} onChange={e => updateRaci(idx, 'responsible', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="A — Aprovador">
                      <Input value={action.accountable} onChange={e => updateRaci(idx, 'accountable', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="C — Consultado">
                      <Input value={action.consulted} onChange={e => updateRaci(idx, 'consulted', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="I — Informado">
                      <Input value={action.informed} onChange={e => updateRaci(idx, 'informed', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Prazo">
                      <Input type="date" value={action.deadline} onChange={e => updateRaci(idx, 'deadline', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Prioridade">
                      <select value={action.priority} onChange={e => updateRaci(idx, 'priority', e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:border-teal-500 focus:outline-none">
                        <option value="">—</option>
                        {['Baixa', 'Média', 'Alta', 'Crítica'].map(p => (
                          <option key={p} value={p} className={priorityColor[p]}>{p}</option>
                        ))}
                      </select>
                    </FormGroup>
                    <FormGroup label="Status">
                      <select value={action.status} onChange={e => updateRaci(idx, 'status', e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:border-teal-500 focus:outline-none">
                        <option value="">—</option>
                        {['Pendente', 'Em andamento', 'Concluído', 'Cancelado'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>
                </div>
              ))}
            </div>
          )}


        </CardContent>
      </Card>

      {/* ── Footer navigation ── */}
      <div className="flex justify-between mt-4">
        <Button variant="ghost" onClick={() => setActiveTab(t => Math.max(0, t - 1))} disabled={activeTab === 0}>
          ← Anterior
        </Button>
        {activeTab < AEP_TABS.length - 1 ? (
          <Button onClick={() => setActiveTab(t => t + 1)}>Próximo →</Button>
        ) : (
          <Button onClick={handleSave} disabled={saving} className="!bg-teal-600 !text-white hover:!bg-teal-700">
            <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Função'}
          </Button>
        )}
      </div>

      {/* Modals for creating new parameters */}
      <UnitModalForm
        open={createModal.open && createModal.type === 'unit'}
        onClose={() => setCreateModal({ ...createModal, open: false })}
        title="Nova Unidade / Filial"
        form={unitForm}
        setForm={setUnitForm}
        onSave={handleSaveUnit}
        companyAddress={matchedCompany ? {
          cep: matchedCompany.cep,
          logradouro: matchedCompany.logradouro,
          numero: matchedCompany.numero,
          complemento: matchedCompany.complemento,
          bairro: matchedCompany.bairro,
          municipio: matchedCompany.municipio,
          uf: matchedCompany.uf,
        } : undefined}
      />

      <SectorModalForm
        open={createModal.open && createModal.type === 'sector'}
        onClose={() => setCreateModal({ ...createModal, open: false })}
        title="Novo Setor / Área"
        form={sectorForm}
        setForm={setSectorForm}
        onSave={handleSaveSector}
        companyUnits={companyUnits}
      />

      <JobRoleModalForm
        open={createModal.open && createModal.type === 'role'}
        onClose={() => setCreateModal({ ...createModal, open: false })}
        title="Novo Cargo / Função"
        form={roleForm}
        setForm={setRoleForm}
        onSave={handleSaveRole}
        companySectors={companySectors}
        companyRoles={companyJobRoles}
      />







    </div>
  );
};
