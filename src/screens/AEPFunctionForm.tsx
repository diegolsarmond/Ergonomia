import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input, Textarea, Select, Checkbox, Combobox, Toggle, RichText } from '../components/ui/Forms';
import { Modal } from '../components/ui/Modal';
import { UnitModalForm, SectorModalForm, JobRoleModalForm, EMPTY_UNIT, EMPTY_SECTOR, EMPTY_ROLE } from '../components/SharedParameterModals';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, Camera } from 'lucide-react';
import { SingleImageUpload } from '../components/SingleImageUpload';
import { ImageEditor } from '../components/ImageEditor';
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
  '5. Psicossocial',
  '6. Classif. de Risco',
  '7. Plano RACI',
];

const ASSESSMENT_OPTIONS: { value: BiomechanicalAssessment; label: string; color: string }[] = [
  { value: 'Regular', label: 'Regular', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'Atenção',  label: 'Atenção', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'Crítico',  label: 'Crítico', color: 'bg-red-100 text-red-800 border-red-300' },
];



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

const MultiSelectAutocomplete: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, options, value, onChange, placeholder }) => {
  const selected = value.split(', ').filter(Boolean);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const toggle = (opt: string) => {
    const cur = value.split(', ').filter(Boolean);
    const nxt = cur.includes(opt) ? cur.filter(v => v !== opt) : [...cur, opt];
    onChange(nxt.join(', '));
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.filter(s => options.includes(s) || s === 'Outros').map(opt => (
            <span key={opt} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700 font-medium">
              {opt}
              <button type="button" onClick={() => toggle(opt)} className="hover:text-teal-900 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setSearch(''); }}
          className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-colors bg-white"
        >
          <span>{placeholder ?? `Selecionar ${label.toLowerCase()}...`}</span>
          <Plus className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute z-40 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>
            <ul className="max-h-48 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-slate-400">Nenhum item encontrado.</li>
              )}
              {filtered.map(opt => {
                const isSelected = selected.includes(opt);
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => { toggle(opt); setOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${isSelected ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-xs ${isSelected ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300'}`}>
                        {isSelected && '✓'}
                      </span>
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>
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

  // Classification — baseada na média geral (escala 1–5)
  // 0–1,9 → VERDE | 2,0–2,9 → AMARELO | 3,0–3,9 → LARANJA | ≥4,0 → VERMELHO
  let classification: 'VERDE' | 'AMARELO' | 'LARANJA' | 'VERMELHO' | '' = '';
  if (overall > 0) {
    if (overall >= 4.0) {
      classification = 'VERMELHO';
    } else if (overall >= 3.0) {
      classification = 'LARANJA';
    } else if (overall >= 2.0) {
      classification = 'AMARELO';
    } else {
      classification = 'VERDE';
    }
  }

  const interpretations: Record<string, string> = {
    VERDE:    'Baixo risco — não recomenda AET.',
    AMARELO:  'Atenção / Moderado — avaliar necessidade de AET.',
    LARANJA:  'Alto risco — recomenda AET.',
    VERMELHO: 'Crítico — AET obrigatória/imediata.',
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
  onSaveAndBack?: (data: AETFunction) => Promise<void>;
}

// ── Component ────────────────────────────────────────────────────────────────

export const AEPFunctionForm: React.FC<Props> = ({ project, funcId, initialData, onSave, onSaveAndBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<AETFunction>(initialData);
  const [editingPhotoIdx, setEditingPhotoIdx] = useState<number | null>(null);
  const [editingRaciPhotoIdx, setEditingRaciPhotoIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    companies, units, sectors, jobRoles,
    addJobRole, addUnit, addSector,
    shifts: shiftCatalog, pauses: pauseCatalog,
    scientificMethodTemplates,
    biomechanicalRiskFactors,
    epis: epiCatalog, addEPI,
    equipment: equipmentCatalog, addEquipment,
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
  const [modalSaving, setModalSaving] = useState(false);

  const handleOpenCreateModal = (type: 'role' | 'unit' | 'sector') => {
    if (type === 'unit') setUnitForm({ ...EMPTY_UNIT, companyId: matchedCompany?.id || '' });
    if (type === 'sector') setSectorForm({ ...EMPTY_SECTOR, companyId: matchedCompany?.id || '' });
    if (type === 'role') setRoleForm({ ...EMPTY_ROLE, companyId: matchedCompany?.id || '' });
    setCreateModal({ type, open: true });
  };

  const handleSaveUnit = async () => {
    if (!unitForm.name.trim() || modalSaving) return;
    setModalSaving(true);
    try {
      await addUnit({ ...unitForm, companyId: matchedCompany?.id || '' });
      setIdent('unitBranch', unitForm.name);
      setCreateModal({ ...createModal, open: false });
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveSector = async () => {
    if (!sectorForm.name.trim() || modalSaving) return;
    setModalSaving(true);
    try {
      await addSector({ ...sectorForm, companyId: matchedCompany?.id || '' });
      setIdent('sectorArea', sectorForm.name);
      setCreateModal({ ...createModal, open: false });
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim() || modalSaving) return;
    setModalSaving(true);
    try {
      await addJobRole({ ...roleForm, companyId: matchedCompany?.id || '' });
      setFormData(prev => ({ ...prev, name: roleForm.name }));
      setCreateModal({ ...createModal, open: false });
    } finally {
      setModalSaving(false);
    }
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
    if (sector) { setIdent('sectorArea', sector.name); setIdent('sectorId', sector.id); }
    if (unit)   { setIdent('unitBranch', unit.name);   setIdent('unitId', unit.id); }
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
    riskFactorId: string,
    field: 'assessment' | 'description',
    value: any,
  ) =>
    setAep(a => {
      const list = [...(a.biomechanics[group] as BiomechanicalItem[])];
      const idx = list.findIndex(i => i.riskFactorId === riskFactorId);
      if (idx >= 0) {
        (list[idx] as any)[field] = value;
      } else {
        list.push({ riskFactorId, assessment: '', description: '', [field]: value });
      }
      return { ...a, biomechanics: { ...a.biomechanics, [group]: list } };
    });

  const addBiomecItem = (
    group: keyof Omit<AEPFunctionAssessment['biomechanics'], 'environmentalComfort'>,
    riskFactorId: string,
  ) =>
    setAep(a => {
      const list = a.biomechanics[group] as BiomechanicalItem[];
      if (list.find(i => i.riskFactorId === riskFactorId)) return a;
      return { ...a, biomechanics: { ...a.biomechanics, [group]: [...list, { riskFactorId, assessment: '', description: '' }] } };
    });

  const removeBiomecItem = (
    group: keyof Omit<AEPFunctionAssessment['biomechanics'], 'environmentalComfort'>,
    riskFactorId: string,
  ) =>
    setAep(a => ({
      ...a,
      biomechanics: { ...a.biomechanics, [group]: (a.biomechanics[group] as BiomechanicalItem[]).filter(i => i.riskFactorId !== riskFactorId) },
    }));

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
        { id: uuidv4(), riskFactor: '', action: '', responsible: '', accountable: '', consulted: '', informed: '', deadline: '', priority: '', status: '', imageDataUrl: '' },
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
      list[idx] = { ...list[idx], [field]: value };
      return { ...a, photographicRecords: list };
    });

  const removePhoto = (idx: number) =>
    setAep(a => ({ ...a, photographicRecords: a.photographicRecords.filter((_, i) => i !== idx) }));

  // ── Save ─────────────────────────────────────────────────────────────────

  const buildSynced = (): AETFunction => {
    // Base: registro já armazenado (preserva campos AET em funções convertidas).
    // Para funções novas (id ausente no projeto), usa formData como base.
    const existingFunc = project.functions.find((f: AETFunction) => f.id === formData.id);
    return {
      ...(existingFunc ?? formData),
      id:                       formData.id,
      name:                     formData.name,
      unit:                     formData.unit,
      sector:                   formData.sector,
      numEmployees:             formData.numEmployees,
      analysisDate:             formData.analysisDate,
      requiresAET:              formData.requiresAET,
      requiresAETJustification: formData.requiresAETJustification,
      aep: formData.aep,
      prescribedTask: formData.aep?.workCharacterization.processDescription || formData.prescribedTask,
      realTask:       formData.aep?.workCharacterization.workCycleDescription || formData.realTask,
      conclusion:     formData.aep?.decisionJustification || formData.conclusion,
      demandFound:    formData.aep?.identification.evaluatedActivity || formData.demandFound,
    };
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setError('O Nome da Função é obrigatório.');
      setActiveTab(0);
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      setError(null);
      await onSave(buildSynced());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Não foi possível salvar a função.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndBack = async () => {
    if (!formData.name?.trim()) {
      setError('O Nome da Função é obrigatório.');
      setActiveTab(0);
      return;
    }
    setSaving(true);
    try {
      setError(null);
      if (onSaveAndBack) {
        await onSaveAndBack(buildSynced());
      } else {
        await onSave(buildSynced());
        navigate(`/project/${project.id}`);
      }
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
    LARANJA:  'bg-orange-100 text-orange-800 border-orange-300',
    VERMELHO: 'bg-red-100 text-red-800 border-red-300',
  };

  const classifTextColor: Record<string, string> = {
    VERDE:    'text-green-700',
    AMARELO:  'text-amber-600',
    LARANJA:  'text-orange-600',
    VERMELHO: 'text-red-700',
  };

  const priorityColor: Record<string, string> = {
    Baixa:   'text-green-700',
    Média:   'text-amber-700',
    Alta:    'text-orange-700',
    Crítica: 'text-red-700',
  };

  const setGroupNA = (
    group: keyof Omit<AEPFunctionAssessment['biomechanics'], 'environmentalComfort'>,
    na: boolean,
  ) =>
    setAep(a => ({
      ...a,
      biomechanics: {
        ...a.biomechanics,
        [group]: na
          ? [{ riskFactorId: '__na__', assessment: 'N.A.' as BiomechanicalAssessment, description: '' }]
          : (a.biomechanics[group] as BiomechanicalItem[]).filter(i => i.riskFactorId !== '__na__'),
      },
    }));

  const renderBiomecGroup = (
    title: string,
    group: keyof Omit<AEPFunctionAssessment['biomechanics'], 'environmentalComfort'>,
  ) => {
    const catalogRisks = biomechanicalRiskFactors.filter(rf =>
      rf.active &&
      rf.biomechanicalFactors?.some(bf => bf.trim().toLowerCase() === title.trim().toLowerCase())
    );
    const allItems = aep.biomechanics[group] as BiomechanicalItem[];
    const isGroupNA = allItems.some(i => i.riskFactorId === '__na__');
    const savedItems = allItems.filter(i => i.riskFactorId !== '__na__');
    const availableToAdd = catalogRisks.filter(rf => !savedItems.find(i => i.riskFactorId === rf.id));

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
          <button
            type="button"
            onClick={() => setGroupNA(group, !isGroupNA)}
            className="flex items-center gap-2 ml-auto group"
            title={isGroupNA ? 'Marcar como aplicável' : 'Marcar como não aplicável'}
          >
            <span className={`text-[10px] font-medium transition-colors ${isGroupNA ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>
              N.A.
            </span>
            <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 transition-colors duration-200 ${
              isGroupNA ? 'bg-slate-300 border-slate-400' : 'bg-teal-500 border-teal-500'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isGroupNA ? 'translate-x-0' : 'translate-x-4'
              }`} />
            </span>
            <span className={`text-[10px] font-medium transition-colors ${isGroupNA ? 'text-slate-500' : 'text-teal-700'}`}>
              Aplica
            </span>
          </button>
        </div>

        {isGroupNA ? (
          <div className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-xl">
            <span className="text-xs text-slate-500 italic">Esta categoria não se aplica à função avaliada.</span>
          </div>
        ) : catalogRisks.length === 0 ? (
          <div className="px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <span className="text-xs text-slate-400 italic">
              Nenhum fator de risco cadastrado para esta categoria em Parâmetros → Fatores de Risco Biomecânicos.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {savedItems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600 w-2/5">Fator de Risco</th>
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600 w-1/5">Avaliação</th>
                      <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">Descrição / Observação</th>
                      <th className="p-2 border border-slate-200 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {savedItems.map(item => {
                      const rf = catalogRisks.find(r => r.id === item.riskFactorId);
                      if (!rf) return null;
                      return (
                        <tr key={item.riskFactorId} className="hover:bg-slate-50/50">
                          <td className="p-2 border border-slate-200 text-slate-700 text-xs font-medium">{rf.name}</td>
                          <td className="p-2 border border-slate-200">
                            <div className="flex flex-wrap items-center gap-1">
                              {ASSESSMENT_OPTIONS.map(o => {
                                const isSelected = item.assessment === o.value;
                                return (
                                  <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => updateBiomecItem(group, item.riskFactorId, 'assessment', isSelected ? '' : o.value)}
                                    className={`px-2 py-1 text-[10px] font-medium rounded-md border transition-all ${
                                      isSelected
                                        ? `${o.color} shadow-sm`
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                  >
                                    {o.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-2 border border-slate-200">
                            <input
                              type="text"
                              value={item.description}
                              onChange={e => updateBiomecItem(group, item.riskFactorId, 'description', e.target.value)}
                              placeholder="Observação..."
                              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10px] focus:border-teal-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 border border-slate-200 text-center">
                            <button
                              type="button"
                              onClick={() => removeBiomecItem(group, item.riskFactorId)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {availableToAdd.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  defaultValue=""
                  onChange={e => { if (e.target.value) { addBiomecItem(group, e.target.value); e.target.value = ''; } }}
                  className="flex-1 rounded-xl border border-dashed border-teal-300 px-3 py-1.5 text-xs text-teal-600 bg-teal-50 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="" disabled>+ Adicionar fator de risco...</option>
                  {availableToAdd.map(rf => (
                    <option key={rf.id} value={rf.id}>{rf.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(`/project/${project.id}`)}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-800">
            {funcId === 'new' ? 'Nova Função AEP' : 'Editar Função AEP'}
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

      {saved && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <Save className="w-4 h-4 shrink-0" /> Dados salvos com sucesso em todas as abas.
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm pt-4 pb-2 mb-6 border-b border-slate-200 -mx-6 px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
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
                    value={companyUnits.find(u => u.id === aep.identification.unitId || u.name === aep.identification.unitBranch)?.id || (aep.identification.unitBranch ? 'custom' : '')}
                    onChange={e => {
                      if (e.target.value === '__NEW__') {
                        handleOpenCreateModal('unit');
                      } else if (e.target.value !== 'custom') {
                        const u = companyUnits.find(x => x.id === e.target.value);
                        if (u) {
                          setIdent('unitBranch', u.name);
                          setIdent('unitId', u.id);
                          setIdent('sectorArea', '');
                          setIdent('sectorId', '');
                        } else {
                          setIdent('unitBranch', '');
                          setIdent('unitId', '');
                          setIdent('sectorArea', '');
                          setIdent('sectorId', '');
                        }
                      }
                    }}
                  >
                    <option value="">Selecione a unidade...</option>
                    {companyUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    {aep.identification.unitBranch && !companyUnits.find(u => u.id === aep.identification.unitId || u.name === aep.identification.unitBranch) && (
                      <option value="custom">{aep.identification.unitBranch}</option>
                    )}
                    <option value="__NEW__" className="font-semibold text-teal-600">+ Criar novo...</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Setor / Área">
                  {(() => {
                    const selectedUnitId = aep.identification.unitId || companyUnits.find(u => u.name === aep.identification.unitBranch)?.id;
                    const unitSectors = selectedUnitId
                      ? companySectors.filter(s => s.unitId === selectedUnitId)
                      : companySectors;
                    return (
                      <Select
                        className="w-full"
                        value={unitSectors.find(s => s.id === aep.identification.sectorId || s.name === aep.identification.sectorArea)?.id || (aep.identification.sectorArea ? 'custom' : '')}
                        onChange={e => {
                          if (e.target.value === '__NEW__') {
                            handleOpenCreateModal('sector');
                          } else if (e.target.value !== 'custom') {
                            const s = unitSectors.find(x => x.id === e.target.value);
                            if (s) {
                              setIdent('sectorArea', s.name);
                              setIdent('sectorId', s.id);
                            } else {
                              setIdent('sectorArea', '');
                              setIdent('sectorId', '');
                            }
                          }
                        }}
                      >
                        <option value="">Selecione o setor...</option>
                        {unitSectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        {aep.identification.sectorArea && !unitSectors.find(s => s.id === aep.identification.sectorId || s.name === aep.identification.sectorArea) && (
                          <option value="custom">{aep.identification.sectorArea}</option>
                        )}
                        <option value="__NEW__" className="font-semibold text-teal-600">+ Criar novo...</option>
                      </Select>
                    );
                  })()}
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
              <SectionTitle>2.1 Organização do Trabalho</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Jornada de Trabalho">
                  <MultiSelectAutocomplete
                    label="Jornada de Trabalho"
                    options={['6h/Dia', '8h/Dia', '12h/Dia', 'Outros']}
                    value={aep.workCharacterization.workOrganization.workday}
                    onChange={v => setWorkOrg('workday', v)}
                  />
                  {aep.workCharacterization.workOrganization.workday.split(', ').includes('Outros') && (
                    <Input
                      className="mt-2"
                      value={(() => {
                        const options = ['6h/Dia', '8h/Dia', '12h/Dia', 'Outros'];
                        return aep.workCharacterization.workOrganization.workday.split(', ').filter(v => v && !options.includes(v)).join(', ');
                      })()}
                      onChange={e => {
                        const options = ['6h/Dia', '8h/Dia', '12h/Dia', 'Outros'];
                        const fromOptions = aep.workCharacterization.workOrganization.workday.split(', ').filter(v => v && options.includes(v));
                        const extra = e.target.value;
                        setWorkOrg('workday', [...fromOptions, extra].filter(Boolean).join(', '));
                      }}
                      placeholder="Outra jornada..."
                    />
                  )}
                </FormGroup>

                <FormGroup label="Escala / Turno">
                  <MultiSelectAutocomplete
                    label="Escala / Turno"
                    options={[...shiftCatalog.filter(s => s.active).map(s => s.name), 'Outros']}
                    value={aep.workCharacterization.workOrganization.scale}
                    onChange={v => setWorkOrg('scale', v)}
                  />
                  {aep.workCharacterization.workOrganization.scale.split(', ').includes('Outros') && (
                    <Input
                      className="mt-2"
                      value={(() => {
                        const options = [...shiftCatalog.filter(s => s.active).map(s => s.name), 'Outros'];
                        return aep.workCharacterization.workOrganization.scale.split(', ').filter(v => v && !options.includes(v)).join(', ');
                      })()}
                      onChange={e => {
                        const options = [...shiftCatalog.filter(s => s.active).map(s => s.name), 'Outros'];
                        const fromOptions = aep.workCharacterization.workOrganization.scale.split(', ').filter(v => v && options.includes(v));
                        const extra = e.target.value;
                        setWorkOrg('scale', [...fromOptions, extra].filter(Boolean).join(', '));
                      }}
                      placeholder="Ex: 6x1, 5x2, 12x36..."
                    />
                  )}
                </FormGroup>

                <FormGroup label="Horas Extras">
                  <MultiSelectAutocomplete
                    label="Horas Extras"
                    options={['Não há', 'Eventualmente', 'Frequentemente', 'Raramente', 'Outros']}
                    value={aep.workCharacterization.workOrganization.overtime}
                    onChange={v => setWorkOrg('overtime', v)}
                  />
                  {aep.workCharacterization.workOrganization.overtime.split(', ').includes('Outros') && (
                    <Input
                      className="mt-2"
                      value={(() => {
                        const options = ['Não há', 'Eventualmente', 'Frequentemente', 'Raramente', 'Outros'];
                        return aep.workCharacterization.workOrganization.overtime.split(', ').filter(v => v && !options.includes(v)).join(', ');
                      })()}
                      onChange={e => {
                        const options = ['Não há', 'Eventualmente', 'Frequentemente', 'Raramente', 'Outros'];
                        const fromOptions = aep.workCharacterization.workOrganization.overtime.split(', ').filter(v => v && options.includes(v));
                        const extra = e.target.value;
                        setWorkOrg('overtime', [...fromOptions, extra].filter(Boolean).join(', '));
                      }}
                      placeholder="Ex: Todo sábado, etc."
                    />
                  )}
                </FormGroup>

                <FormGroup label="Pausa para o almoço">
                  <MultiSelectAutocomplete
                    label="Pausa para o almoço"
                    options={['60min.', '15min.', 'N/A', 'Outros']}
                    value={aep.workCharacterization.workOrganization.lunchBreak}
                    onChange={v => setWorkOrg('lunchBreak', v)}
                  />
                  {aep.workCharacterization.workOrganization.lunchBreak.split(', ').includes('Outros') && (
                    <Input
                      className="mt-2"
                      value={(() => {
                        const options = ['60min.', '15min.', 'N/A', 'Outros'];
                        return aep.workCharacterization.workOrganization.lunchBreak.split(', ').filter(v => v && !options.includes(v)).join(', ');
                      })()}
                      onChange={e => {
                        const options = ['60min.', '15min.', 'N/A', 'Outros'];
                        const fromOptions = aep.workCharacterization.workOrganization.lunchBreak.split(', ').filter(v => v && options.includes(v));
                        const extra = e.target.value;
                        setWorkOrg('lunchBreak', [...fromOptions, extra].filter(Boolean).join(', '));
                      }}
                      placeholder="Outra pausa..."
                    />
                  )}
                </FormGroup>

                <FormGroup label="Outras Pausas">
                  <MultiSelectAutocomplete
                    label="Outras Pausas"
                    options={['Não há', '10min.', '15min.', 'Outros']}
                    value={aep.workCharacterization.workOrganization.otherBreaks}
                    onChange={v => setWorkOrg('otherBreaks', v)}
                  />
                  {aep.workCharacterization.workOrganization.otherBreaks.split(', ').includes('Outros') && (
                    <Input
                      className="mt-2"
                      value={(() => {
                        const options = ['Não há', '10min.', '15min.', 'Outros'];
                        return aep.workCharacterization.workOrganization.otherBreaks.split(', ').filter(v => v && !options.includes(v)).join(', ');
                      })()}
                      onChange={e => {
                        const options = ['Não há', '10min.', '15min.', 'Outros'];
                        const fromOptions = aep.workCharacterization.workOrganization.otherBreaks.split(', ').filter(v => v && options.includes(v));
                        const extra = e.target.value;
                        setWorkOrg('otherBreaks', [...fromOptions, extra].filter(Boolean).join(', '));
                      }}
                      placeholder="Descreva outras pausas existentes..."
                    />
                  )}
                </FormGroup>

                <FormGroup label="Rodízio de Tarefas">
                  <MultiSelectAutocomplete
                    label="Rodízio de Tarefas"
                    options={['Não há rodízio formalizado', 'Outros']}
                    value={aep.workCharacterization.workOrganization.taskRotation}
                    onChange={v => setWorkOrg('taskRotation', v)}
                  />
                  {aep.workCharacterization.workOrganization.taskRotation.split(', ').includes('Outros') && (
                    <Input
                      className="mt-2"
                      value={(() => {
                        const options = ['Não há rodízio formalizado', 'Outros'];
                        return aep.workCharacterization.workOrganization.taskRotation.split(', ').filter(v => v && !options.includes(v)).join(', ');
                      })()}
                      onChange={e => {
                        const options = ['Não há rodízio formalizado', 'Outros'];
                        const fromOptions = aep.workCharacterization.workOrganization.taskRotation.split(', ').filter(v => v && options.includes(v));
                        const extra = e.target.value;
                        setWorkOrg('taskRotation', [...fromOptions, extra].filter(Boolean).join(', '));
                      }}
                      placeholder="Descreva o rodízio..."
                    />
                  )}
                </FormGroup>

              </div>
              <FormGroup label="Diálogos de Segurança / DDS">
                <MultiSelectAutocomplete
                  label="Diálogos de Segurança / DDS"
                  options={['Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Não há', 'Outros']}
                  value={aep.workCharacterization.workOrganization.safetyDialogues}
                  onChange={v => setWorkOrg('safetyDialogues', v)}
                />
                {aep.workCharacterization.workOrganization.safetyDialogues.split(', ').includes('Outros') && (
                  <Input
                    className="mt-2"
                    value={(() => {
                      const options = ['Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Não há', 'Outros'];
                      return aep.workCharacterization.workOrganization.safetyDialogues.split(', ').filter(v => v && !options.includes(v)).join(', ');
                    })()}
                    onChange={e => {
                      const options = ['Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Não há', 'Outros'];
                      const fromOptions = aep.workCharacterization.workOrganization.safetyDialogues.split(', ').filter(v => v && options.includes(v));
                      const extra = e.target.value;
                      setWorkOrg('safetyDialogues', [...fromOptions, extra].filter(Boolean).join(', '));
                    }}
                    placeholder="Ex: Trimestral..."
                  />
                )}
              </FormGroup>

              <SectionTitle>2.2 Descrição do Processo e Ciclo de Trabalho</SectionTitle>
              <FormGroup label="Descrição">
                <RichText value={aep.workCharacterization.processDescription} onChange={val => setWork('processDescription', val)} placeholder="Descreva o processo produtivo e o ciclo de trabalho." />
              </FormGroup>

              <SectionTitle>2.3 Equipamentos e EPIs</SectionTitle>
              <FormGroup label="Equipamentos Utilizados">
                <CatalogMultiSelect
                  label="Equipamentos"
                  items={[...equipmentCatalog, { id: 'outros', name: 'Outros', active: true } as any]}
                  value={aep.workCharacterization.toolsAndMaterials.description}
                  onChange={v => setTools('description', v)}
                  onAddNew={async name => {
                    await addEquipment({ name, category: '', operation: [], description: '', hasDimensions: false, active: true });
                  }}
                  placeholder="Selecionar equipamentos do catálogo..."
                />
                {aep.workCharacterization.toolsAndMaterials.description.split(', ').includes('Outros') && (
                  <Input
                    className="mt-2"
                    value={(() => {
                      const catalogNames = [...equipmentCatalog.map(e => e.name), 'Outros'];
                      return aep.workCharacterization.toolsAndMaterials.description
                        .split(', ').filter(n => n && !catalogNames.includes(n)).join(', ');
                    })()}
                    onChange={e => {
                      const catalogNames = [...equipmentCatalog.map(eq => eq.name), 'Outros'];
                      const fromCatalog = aep.workCharacterization.toolsAndMaterials.description
                        .split(', ').filter(n => n && catalogNames.includes(n));
                      const extra = e.target.value;
                      setTools('description', [...fromCatalog, extra].filter(Boolean).join(', '));
                    }}
                    placeholder="Especifique outros equipamentos (separados por vírgula)..."
                  />
                )}
              </FormGroup>
              <FormGroup label="EPIs Utilizados">
                <CatalogMultiSelect
                  label="EPIs"
                  items={[...epiCatalog, { id: 'outros', name: 'Outros', active: true } as any]}
                  value={aep.workCharacterization.toolsAndMaterials.epis}
                  onChange={v => setTools('epis', v)}
                  onAddNew={async name => {
                    await addEPI({ name, type: '', description: '', mandatoryByDefault: false, active: true });
                  }}
                  placeholder="Selecionar EPIs do catálogo..."
                />
                {aep.workCharacterization.toolsAndMaterials.epis.split(', ').includes('Outros') && (
                  <Input
                    className="mt-2"
                    value={(() => {
                      const catalogNames = [...epiCatalog.map(e => e.name), 'Outros'];
                      return aep.workCharacterization.toolsAndMaterials.epis
                        .split(', ').filter(n => n && !catalogNames.includes(n)).join(', ');
                    })()}
                    onChange={e => {
                      const catalogNames = [...epiCatalog.map(ep => ep.name), 'Outros'];
                      const fromCatalog = aep.workCharacterization.toolsAndMaterials.epis
                        .split(', ').filter(n => n && catalogNames.includes(n));
                      const extra = e.target.value;
                      setTools('epis', [...fromCatalog, extra].filter(Boolean).join(', '));
                    }}
                    placeholder="Especifique outros EPIs (separados por vírgula)..."
                  />
                )}
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
                    {photo.imageDataUrl ? (
                      <div className="space-y-1.5">
                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 cursor-pointer" onClick={() => setEditingPhotoIdx(idx)}>
                          <img
                            src={photo.imageDataUrl}
                            alt={`Foto ${idx + 1}`}
                            className="w-full max-h-48 object-contain bg-slate-50"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-medium shadow">
                              ✏️ Clique para editar
                            </span>
                          </div>
                        </div>
                        <SingleImageUpload
                          value=""
                          onChange={url => {
                            if (url) { updatePhoto(idx, 'imageDataUrl', url); setEditingPhotoIdx(idx); }
                          }}
                          label="Trocar imagem"
                        />
                      </div>
                    ) : (
                      <SingleImageUpload
                        value=""
                        onChange={url => {
                          updatePhoto(idx, 'imageDataUrl', url);
                          if (url) setEditingPhotoIdx(idx);
                        }}
                        label="Imagem"
                      />
                    )}
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
                      <FormGroup label="Haveria Queixa?">
                        <Toggle 
                          checked={aep.biomechanics.environmentalComfort.lightingComplaint === 'Sim'} 
                          onChange={v => setEnvComfort('lightingComplaint', v ? 'Sim' : 'Não')}
                          label={aep.biomechanics.environmentalComfort.lightingComplaint === 'Sim' ? 'Sim' : 'Não'}
                        />
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
                      <FormGroup label="Haveria Queixa?">
                        <Toggle 
                          checked={aep.biomechanics.environmentalComfort.noiseComplaint === 'Sim'} 
                          onChange={v => setEnvComfort('noiseComplaint', v ? 'Sim' : 'Não')}
                          label={aep.biomechanics.environmentalComfort.noiseComplaint === 'Sim' ? 'Sim' : 'Não'}
                        />
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
                      <FormGroup label="Haveria Queixa?">
                        <Toggle 
                          checked={aep.biomechanics.environmentalComfort.temperatureComplaint === 'Sim'} 
                          onChange={v => setEnvComfort('temperatureComplaint', v ? 'Sim' : 'Não')}
                          label={aep.biomechanics.environmentalComfort.temperatureComplaint === 'Sim' ? 'Sim' : 'Não'}
                        />
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

          {/* ── Tab 5: Psicossocial ── */}
          {activeTab === 4 && (() => {
            const groups = Array.from(new Set(aep.psychosocialAnswers.map(q => q.group)));
            return (
              <div className="space-y-4">
                <SectionTitle>5. Avaliação Psicossocial</SectionTitle>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-6">
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
                <p className="text-xs text-slate-500 font-medium bg-white p-3 rounded-xl border border-slate-200 mb-6">
                  Escala: 1 = Nunca · 2 = Raramente · 3 = Às vezes · 4 = Frequentemente · 5 = Sempre
                </p>

                {groups.map(groupName => (
                  <div key={groupName} className="mb-8">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 px-1">{groupName}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">Fator Psicossocial</th>
                            <th className="text-center p-2 border border-slate-200 font-medium text-slate-600 w-48">Pontuação</th>
                            <th className="text-left p-2 border border-slate-200 font-medium text-slate-600">Observações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aep.psychosocialAnswers
                            .map((q, idx) => ({ q, idx }))
                            .filter(x => x.q.group === groupName)
                            .map(({ q, idx }) => (
                              <tr key={q.id} className={`hover:bg-slate-50/50 ${q.inverted ? 'bg-teal-50/20' : ''}`}>
                                <td className="p-2 border border-slate-200 text-slate-700 text-xs">
                                  {q.question}
                                  {q.inverted && <span className="ml-1 text-[10px] text-teal-600 font-medium">(invertida)</span>}
                                </td>
                                <td className="p-2 border border-slate-200 text-center">
                                  <div className="flex justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map(n => {
                                      const isSelected = q.score === n;
                                      return (
                                        <button
                                          key={n}
                                          type="button"
                                          onClick={() => updatePsy(idx, 'score', isSelected ? '' : n)}
                                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                                            isSelected 
                                              ? 'bg-teal-600 text-white border-teal-600 shadow-md transform scale-110' 
                                              : 'bg-white text-slate-400 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                                          }`}
                                        >
                                          {n}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="p-2 border border-slate-200">
                                  <input
                                    type="text"
                                    value={q.comments}
                                    onChange={e => updatePsy(idx, 'comments', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10px] focus:border-teal-500 focus:outline-none"
                                  />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

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
                        <span className={`font-bold ${classifTextColor[aep.psychosocialClassification] || 'text-slate-900'}`}>{aep.psychosocialAverages.overall.toFixed(2)}</span>
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
            );
          })()}

          {/* ── Tab 6: Classificação de Risco / Gatilhos AET ── */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <SectionTitle>6. Classificação de Risco — Gatilhos para AET</SectionTitle>
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
                        <td className="p-2 border border-slate-200 text-center flex justify-center">
                          <Toggle 
                            checked={t.answer === 'Sim'} 
                            onChange={v => updateTrigger(idx, 'answer', v ? 'Sim' : 'Não')}
                            label={t.answer === 'Sim' ? 'Sim' : 'Não'}
                          />
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Editar manualmente:</span>
                  <Toggle 
                    checked={formData.requiresAET ?? false} 
                    onChange={v => setField('requiresAET', v)} 
                  />
                </div>
              </div>

              <FormGroup label="Justificativa da Decisão">
                <RichText
                  value={aep.decisionJustification}
                  onChange={val => setAep(a => ({ ...a, decisionJustification: val }))}
                  placeholder="Justifique a decisão de indicar ou não a AET."
                />
              </FormGroup>
              <FormGroup label="Diagnóstico">
                <RichText
                  value={aep.finalGuidance}
                  onChange={val => setAep(a => ({ ...a, finalGuidance: val }))}
                  placeholder="Orientações gerais ao cliente após a avaliação preliminar."
                />
              </FormGroup>
            </div>
          )}

          {/* ── Tab 7: Plano de Ação RACI ── */}
          {activeTab === 6 && (
            <div className="space-y-4">
              <SectionTitle>7. Plano de Ação RACI</SectionTitle>
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
                  <FormGroup label="Foto / Print">
                    {action.imageDataUrl ? (
                      <div className="space-y-1.5">
                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 cursor-pointer" onClick={() => setEditingRaciPhotoIdx(idx)}>
                          <img
                            src={action.imageDataUrl}
                            alt={`Foto ação ${idx + 1}`}
                            className="w-full max-h-48 object-contain bg-slate-50"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-medium shadow">
                              ✏️ Clique para editar
                            </span>
                          </div>
                        </div>
                        <SingleImageUpload
                          value=""
                          onChange={url => { if (url) { updateRaci(idx, 'imageDataUrl', url); setEditingRaciPhotoIdx(idx); } }}
                          label="Trocar imagem"
                        />
                      </div>
                    ) : (
                      <SingleImageUpload
                        value=""
                        onChange={url => { if (url) { updateRaci(idx, 'imageDataUrl', url); setEditingRaciPhotoIdx(idx); } }}
                        label="Imagem"
                      />
                    )}
                  </FormGroup>
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving} className="border-teal-600 text-teal-600 hover:bg-teal-50">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          {activeTab < AEP_TABS.length - 1 ? (
            <Button onClick={() => setActiveTab(t => t + 1)}>Próximo →</Button>
          ) : (
            <Button onClick={handleSaveAndBack} disabled={saving} className="!bg-teal-600 !text-white hover:!bg-teal-700">
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar Função'}
            </Button>
          )}
        </div>
      </div>

      {/* Modals for creating new parameters */}
      <UnitModalForm
        open={createModal.open && createModal.type === 'unit'}
        onClose={() => setCreateModal({ ...createModal, open: false })}
        title="Nova Unidade / Filial"
        form={unitForm}
        setForm={setUnitForm}
        onSave={handleSaveUnit}
        isSaving={modalSaving}
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
        isSaving={modalSaving}
        companyUnits={companyUnits}
      />

      <JobRoleModalForm
        open={createModal.open && createModal.type === 'role'}
        onClose={() => setCreateModal({ ...createModal, open: false })}
        title="Novo Cargo / Função"
        form={roleForm}
        setForm={setRoleForm}
        onSave={handleSaveRole}
        isSaving={modalSaving}
        companySectors={companySectors}
        companyRoles={companyJobRoles}
      />

      {editingPhotoIdx !== null && aep.photographicRecords[editingPhotoIdx]?.imageDataUrl && (
        <ImageEditor
          imageDataUrl={aep.photographicRecords[editingPhotoIdx].imageDataUrl}
          onSave={url => {
            updatePhoto(editingPhotoIdx, 'imageDataUrl', url);
            setEditingPhotoIdx(null);
          }}
          onClose={() => setEditingPhotoIdx(null)}
        />
      )}

      {editingRaciPhotoIdx !== null && aep.raciActionPlan[editingRaciPhotoIdx]?.imageDataUrl && (
        <ImageEditor
          imageDataUrl={aep.raciActionPlan[editingRaciPhotoIdx].imageDataUrl!}
          onSave={url => {
            updateRaci(editingRaciPhotoIdx, 'imageDataUrl', url);
            setEditingRaciPhotoIdx(null);
          }}
          onClose={() => setEditingRaciPhotoIdx(null)}
        />
      )}







    </div>
  );
};
