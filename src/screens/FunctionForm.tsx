import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { FormGroup, Input, Textarea, Select, Checkbox, Combobox } from '../components/ui/Forms';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2, ChevronRight, Lock, CheckCircle, XCircle, Shield, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AETFunction, AETEquipmentItem, AETEPIItem, AETImprovement, AETScientificMethod, AETImage, EMPTY_FUNCTION, ErgonomicRisk, NHO11MeasurementPoint, NHO11ModelType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ImageUpload } from '../components/ImageUpload';
import { createEmptyErgonomicRisk } from '../domain/risks/riskFactory';
import { calculateRiskScore, isValidationError } from '../domain/risks/riskMatrix';
import { calculateNHO11Simple, isNHO11ValidationError } from '../domain/nho11/nho11Calculator';
import { AEPFunctionForm } from './AEPFunctionForm';

const TABS = [
  'Identificação',
  'Org. do Trabalho',
  'Perfil e Entrevista',
  'Atividade e Ambiente',
  'Equipamentos, EPIs e Posturas',
  'Iluminação NHO 11',
  'Métodos Ergonômicos',
  'Riscos e Melhorias',
  'Diagnóstico Final',
];

const DAYS_OF_WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// ── helpers ─────────────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="section-title first:!mt-0">
    {children}
  </div>
);

const RadioGroup = ({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) => (
  <FormGroup label={label}>
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`cursor-pointer px-3.5 py-1.5 border rounded-full text-sm transition-all duration-200 ${
            value === opt.value
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <input
            type="radio"
            name={name}
            className="hidden"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  </FormGroup>
);


// ── main component ──────────────────────────────────────────────────────────

export const FunctionForm = () => {
  const { id, funcId } = useParams<{ id: string; funcId: string }>();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('PROJECTS_EDIT');
  const {
    getProject, fetchProjectDetails, addFunction, updateFunction, checklistQuestions,
    scientificMethodTemplates, equipment, epis, surveyQuestions,
    shifts, addShift, pauses, companies, units, sectors, jobRoles
  } = useAET();
  const navigate = useNavigate();

  const [loadingProject, setLoadingProject] = useState(true);
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  React.useEffect(() => {
    if (id) {
      setLoadingProject(true);
      fetchProjectDetails(id)
        .catch(err => console.error(err))
        .finally(() => setLoadingProject(false));
    }
  }, [id, fetchProjectDetails]);

  const project = getProject(id!);
  const [activeTab, setActiveTab] = useState(0);

  const isNew = funcId === 'new';
  const [formData, setFormData] = useState<AETFunction>(EMPTY_FUNCTION);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!loadingProject && project && !isDataInitialized) {
      const initialData = isNew 
        ? { ...EMPTY_FUNCTION } 
        : project.functions.find((f) => f.id === funcId) || ({} as AETFunction);
      setFormData(initialData);
      setIsDataInitialized(true);
    }
  }, [loadingProject, project, isNew, funcId, isDataInitialized]);

  if (loadingProject || !isDataInitialized) return (
    <div className="flex items-center justify-center h-full min-h-[50vh] p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Carregando detalhes do projeto...</p>
      </div>
    </div>
  );

  if (!project || (!isNew && !formData.id)) return <div className="p-8">Função não encontrada.</div>;

  // ── AEP: delegate to dedicated form ────────────────────────────────────────
  if (project.reportType === 'AEP') {
    const handleAEPSave = async (data: AETFunction) => {
      if (!canEdit) return;
      if (isNew) {
        const newId = await addFunction(id!, data);
        navigate(`/project/${id}/function/${newId}`, { replace: true });
      } else {
        await updateFunction(id!, funcId!, data);
      }
    };
    const handleAEPSaveAndBack = async (data: AETFunction) => {
      if (!canEdit) return;
      if (isNew) {
        const newId = await addFunction(id!, data);
        navigate(`/project/${id}/function/${newId}`, { replace: true });
      } else {
        await updateFunction(id!, funcId!, data);
        navigate(`/project/${id}`);
      }
    };
    return (
      <AEPFunctionForm
        project={project}
        funcId={funcId!}
        initialData={formData}
        onSave={handleAEPSave}
        onSaveAndBack={handleAEPSaveAndBack}
      />
    );
  }

  const nhoPoints    = formData.illumination.measurementPoints || [];
  const nhoRefLux    = formData.illumination.referenceLux || 0;
  const nhoModelType: NHO11ModelType = formData.illumination.modelType ?? 'SIMPLE_AVERAGE';
  const nhoResult = (() => {
    if (nhoModelType === 'OUTDOOR_NOT_APPLICABLE') {
      const r = calculateNHO11Simple({ location: '', date: '', environmentType: '', taskType: '', referenceLux: 0, points: [], modelType: nhoModelType });
      return isNHO11ValidationError(r) ? null : r;
    }
    if (nhoPoints.length === 0 || nhoRefLux <= 0) return null;
    const r = calculateNHO11Simple({ location: '', date: '', environmentType: '', taskType: '', referenceLux: nhoRefLux, points: nhoPoints, modelType: nhoModelType });
    return isNHO11ValidationError(r) ? null : r;
  })();

  const set = (field: keyof AETFunction, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const setIllum = (field: string, value: any) =>
    setFormData((prev) => ({
      ...prev,
      illumination: { ...prev.illumination, [field]: value },
    }));

  const handleSave = async () => {
    if (!canEdit) return;
    try {
      if (!formData.name?.trim()) {
        setError('O Nome da Função é obrigatório.');
        setActiveTab(0);
        return;
      }
      if (!formData.numEmployees?.trim()) {
        setError('O Nº de colaboradores é obrigatório.');
        setActiveTab(0);
        return;
      }
      setError(null);
      console.log('Salvando função...', { isNew, id, funcId, formData });
      if (isNew) {
        const newId = await addFunction(id!, formData);
        console.log('Função adicionada com ID:', newId);
      } else {
        await updateFunction(id!, funcId!, formData);
        console.log('Função atualizada');
      }
      navigate(`/project/${id}`);
    } catch (err) {
      console.error('Erro ao salvar função:', err);
      setError('Não foi possível salvar a função. Verifique os campos obrigatórios e tente novamente.');
      alert('Não conseguimos salvar a função agora. Se o problema persistir, atualize a página e tente novamente.');
    }
  };

  const [newShiftName, setNewShiftName] = useState('');
  const [showNewShiftInput, setShowNewShiftInput] = useState(false);

  const handleAddQuickShift = async () => {
    if (!newShiftName.trim()) return;
    await addShift({ name: newShiftName, description: 'Cadastrado via formulário', active: true });
    setNewShiftName('');
    setShowNewShiftInput(false);
  };

  // ── Equipment helpers ────────────────────────────────────────────────────
  const addEquipment = () =>
    set('equipmentList', [
      ...(formData.equipmentList || []),
      { id: uuidv4(), name: '', quantity: '', dimensions: '', principle: '', condition: '', observations: '' } as AETEquipmentItem,
    ]);

  const updateEquipment = (idx: number, field: keyof AETEquipmentItem, value: any) => {
    const list = [...(formData.equipmentList || [])];
    (list[idx] as any)[field] = value;
    set('equipmentList', list);
  };

  const removeEquipment = (idx: number) =>
    set('equipmentList', (formData.equipmentList || []).filter((_, i) => i !== idx));

  // ── EPI helpers ──────────────────────────────────────────────────────────
  const addEPI = () =>
    set('epiList', [
      ...(formData.epiList || []),
      { id: uuidv4(), name: '', mandatory: false, occasional: false, location: '', observations: '' } as AETEPIItem,
    ]);

  const updateEPI = (idx: number, field: keyof AETEPIItem, value: any) => {
    const list = [...(formData.epiList || [])];
    (list[idx] as any)[field] = value;
    set('epiList', list);
  };

  const removeEPI = (idx: number) =>
    set('epiList', (formData.epiList || []).filter((_, i) => i !== idx));

  // ── Improvement helpers ──────────────────────────────────────────────────
  const addImprovement = () =>
    set('improvements', [
      ...(formData.improvements || []),
      {
        id: uuidv4(), photoDataUrl: '', hazard: '', probability: '', severity: '',
        grossRiskLevel: '', riskClassification: '', riskEvaluation: '', actions: '',
        attenuationProbability: '', deadline: '', responsible: '', observations: '',
      } as AETImprovement,
    ]);

  const updateImprovement = (idx: number, field: keyof AETImprovement, value: any) => {
    const list = [...(formData.improvements || [])];
    (list[idx] as any)[field] = value;
    set('improvements', list);
  };

  const removeImprovement = (idx: number) =>
    set('improvements', (formData.improvements || []).filter((_, i) => i !== idx));

  // ── ErgonomicRisk helpers ────────────────────────────────────────────────
  const addRisk = () =>
    set('risks', [...(formData.risks || []), createEmptyErgonomicRisk()]);

  const updateRisk = (idx: number, field: keyof ErgonomicRisk, value: any) => {
    const list = [...(formData.risks || [])];
    const risk = { ...list[idx], [field]: value };
    if (field === 'probability' || field === 'severity') {
      const p = field === 'probability' ? Number(value) : Number(risk.probability);
      const s = field === 'severity'    ? Number(value) : Number(risk.severity);
      const result = calculateRiskScore(p, s);
      if (!isValidationError(result)) {
        risk.score     = result.score;
        risk.riskLevel = result.level;
      }
    }
    list[idx] = risk;
    set('risks', list);
  };

  const removeRisk = (idx: number) =>
    set('risks', (formData.risks || []).filter((_, i) => i !== idx));

  // ── Scientific method helpers ────────────────────────────────────────────
  const addMethod = () =>
    set('scientificMethods', [
      ...(formData.scientificMethods || []),
      { id: uuidv4(), methodName: '', description: '', result: '', riskClassification: '', interpretation: '', imageDataUrl: '', recommendations: '' } as AETScientificMethod,
    ]);

  const updateMethod = (idx: number, field: keyof AETScientificMethod, value: any) => {
    const list = [...(formData.scientificMethods || [])];
    (list[idx] as any)[field] = value;
    set('scientificMethods', list);
  };

  const removeMethod = (idx: number) =>
    set('scientificMethods', (formData.scientificMethods || []).filter((_, i) => i !== idx));

  // ── Illumination checklist helpers ───────────────────────────────────────
  const updateChecklistItem = (idx: number, field: string, value: any) => {
    const list = [...(formData.illumination.checklist || [])];
    (list[idx] as any)[field] = value;
    setIllum('checklist', list);
  };

  const addChecklistItem = () => {
    const list = [...(formData.illumination.checklist || [])];
    list.push({ id: uuidv4(), description: '', compliant: '', recommendedAction: '', deadline: '', responsible: '', observations: '' });
    setIllum('checklist', list);
  };

  const removeChecklistItem = (idx: number) =>
    setIllum('checklist', (formData.illumination.checklist || []).filter((_, i) => i !== idx));

  // ── NHO 11 measurement-point helpers ─────────────────────────────────────

  const recalcAndSetNHO11 = (points: NHO11MeasurementPoint[], refLux: number, modelType: NHO11ModelType = 'SIMPLE_AVERAGE') => {
    const canCalc = modelType === 'OUTDOOR_NOT_APPLICABLE' || (points.length > 0 && refLux > 0);
    if (canCalc) {
      const r = calculateNHO11Simple({ location: '', date: '', environmentType: '', taskType: '', referenceLux: refLux, points, modelType });
      if (!isNHO11ValidationError(r)) {
        setFormData(prev => ({
          ...prev,
          illumination: {
            ...prev.illumination,
            modelType,
            measurementPoints: points,
            referenceLux: refLux,
            resultLux: r.conclusion === 'não_aplicável' ? 'N/A' : String(r.averageLux),
            interpretation: r.interpretationText,
            conclusion: r.conclusion,
            conclusionText: r.conclusion === 'adequada'
              ? `Iluminância média de ${r.averageLux} lux está adequada conforme NHO 11 – Fundacentro.`
              : r.conclusion === 'não_aplicável'
              ? 'Ambiente externo – avaliação de iluminância por NHO 11 não se aplica neste tipo de ambiente.'
              : `Iluminância média de ${r.averageLux} lux está abaixo do limiar mínimo de ${r.tolerance10Percent} lux. É necessária intervenção.`,
          },
        }));
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      illumination: { ...prev.illumination, modelType, measurementPoints: points, referenceLux: refLux },
    }));
  };

  const handleModelTypeChange = (newModelType: NHO11ModelType) => {
    if (newModelType === 'OUTDOOR_NOT_APPLICABLE') {
      recalcAndSetNHO11([], 0, newModelType);
    } else {
      recalcAndSetNHO11(formData.illumination.measurementPoints || [], formData.illumination.referenceLux || 0, newModelType);
    }
  };

  const addMeasurementPoint = () => {
    const points = [...(formData.illumination.measurementPoints || [])];
    points.push({ id: uuidv4(), label: `Ponto ${points.length + 1}`, lux: 0 });
    recalcAndSetNHO11(points, formData.illumination.referenceLux || 0, nhoModelType);
  };

  const updateMeasurementPoint = (idx: number, field: 'label' | 'lux', value: string | number) => {
    const points = [...(formData.illumination.measurementPoints || [])];
    (points[idx] as any)[field] = value;
    recalcAndSetNHO11(points, formData.illumination.referenceLux || 0, nhoModelType);
  };

  const removeMeasurementPoint = (idx: number) => {
    const points = (formData.illumination.measurementPoints || []).filter((_, i) => i !== idx);
    recalcAndSetNHO11(points, formData.illumination.referenceLux || 0, nhoModelType);
  };

  const setRefLux = (val: number) => {
    recalcAndSetNHO11(formData.illumination.measurementPoints || [], val, nhoModelType);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
        <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors cursor-pointer">Projetos</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate(`/project/${id}`)} className="hover:text-teal-600 transition-colors cursor-pointer truncate">{project?.companyName}</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 font-medium truncate">{formData.name || 'Nova Função'}</span>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          {formData.name || 'Nova Função'}
        </h1>
        <div className="flex items-center gap-3">
          {!canEdit && (
            <div className="text-amber-700 font-medium flex items-center text-sm bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <Lock className="w-4 h-4 mr-1.5" />
              Você não possui permissão para editar este projeto.
            </div>
          )}
          {error && (
            <div className="text-red-500 font-medium flex items-center text-sm bg-red-50 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {error}
            </div>
          )}
          <Button onClick={handleSave} disabled={!canEdit}>
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm pt-4 pb-2 mb-6 border-b border-slate-200 -mx-6 px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {TABS.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`tab-pill ${activeTab === idx ? 'active' : ''}`}
            >
              {idx + 1}. {tab}
            </button>
          ))}
        </div>
      </div>

      <Card className="!rounded-2xl">
        <CardContent className="pt-6">

          {/* ── Tab 0: Identificação ───────────────────────────────────────── */}
          {activeTab === 0 && (() => {
            const matchedCompany = companies.find(c => 
              (c.cnpj && project.cnpj && c.cnpj.replace(/\D/g, '') === project.cnpj.replace(/\D/g, '')) || 
              c.razaoSocial === project.companyName || 
              c.nomeFantasia === project.companyName
            );

            const companyUnits = matchedCompany ? units.filter(u => u.companyId === matchedCompany.id) : [];
            const companySectors = matchedCompany ? sectors.filter(s => s.companyId === matchedCompany.id) : [];
            const companyJobRoles = matchedCompany ? jobRoles.filter(r => r.companyId === matchedCompany.id) : [];

            const handleApplyJobRole = (roleId: string) => {
              const role = companyJobRoles.find(r => r.id === roleId);
              if (!role) return;

              const sector = companySectors.find(s => s.id === role.sectorId);
              const unit = sector ? companyUnits.find(u => u.id === sector.unitId) : null;

              // Pre-fill EPIs and equipment from linked catalog items
              const roleEpis = (role.epiIds ?? [])
                .map(id => epis.find(e => e.id === id))
                .filter(Boolean) as typeof epis;
              const roleEquip = (role.equipmentIds ?? [])
                .map(id => equipment.find(e => e.id === id))
                .filter(Boolean) as typeof equipment;

              setFormData(prev => ({
                ...prev,
                name: role.name,
                sector: sector ? sector.name : prev.sector,
                unit: unit ? unit.name : prev.unit,
                usesEPI: roleEpis.length > 0 || prev.usesEPI,
                epiList: roleEpis.length > 0
                  ? roleEpis.map(e => ({ id: e.id, name: e.name, mandatory: false, occasional: false, location: '', observations: '' }))
                  : prev.epiList,
                usesEquipment: roleEquip.length > 0 || prev.usesEquipment,
                equipmentList: roleEquip.length > 0
                  ? roleEquip.map(e => ({ id: e.id, name: e.name, quantity: '', dimensions: '', principle: '', condition: '', observations: '' }))
                  : prev.equipmentList,
              }));
            };

            return (
              <div className="space-y-4">
                <SectionTitle>Cadastro da Função</SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Nome da Função" required>
                    <Combobox
                      listId="jobRolesList"
                      options={companyJobRoles}
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        set('name', val);
                        const role = companyJobRoles.find(r => r.name === val);
                        if (role) handleApplyJobRole(role.id);
                      }}
                      placeholder="Digite ou selecione a função..."
                    />
                  </FormGroup>
                  <FormGroup label="Nº de Colaboradores" required>
                    <Input value={formData.numEmployees} onChange={(e) => set('numEmployees', e.target.value)} />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Unidade">
                    <Combobox
                      listId="unitsList"
                      options={companyUnits}
                      value={formData.unit}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = companyUnits.find(u => u.name === val);
                        set('unit', val);
                        set('unidadeId', matched?.id ?? '');
                      }}
                      placeholder="Digite ou selecione a unidade..."
                    />
                  </FormGroup>
                  <FormGroup label="Setor">
                    <Combobox
                      listId="sectorsList"
                      options={companySectors}
                      value={formData.sector}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = companySectors.find(s => s.name === val);
                        set('sector', val);
                        set('setorId', matched?.id ?? '');
                      }}
                      placeholder="Digite ou selecione o setor..."
                    />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Data da Análise">
                    <Input type="date" value={formData.analysisDate} onChange={(e) => set('analysisDate', e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Status da Análise">
                    <Select value={formData.demandFound} onChange={(e) => set('demandFound', e.target.value)}>
                      <option value="">Selecione...</option>
                      <option value="Posto passível de investigações ergonômicas">Passível de investigações</option>
                      <option value="Posto passível de modificações ergonômicas">Passível de modificações</option>
                      <option value="Posto sem necessidade de intervenção imediata">Sem intervenção imediata</option>
                      <option value="Análise concluída">Análise concluída</option>
                    </Select>
                  </FormGroup>
                </div>

                <SectionTitle>Origem e Objetivo</SectionTitle>
                <FormGroup label="Origem da Demanda">
                  <Textarea value={formData.demandOrigin} onChange={(e) => set('demandOrigin', e.target.value)} rows={3} />
                </FormGroup>
                <FormGroup label="Objetivo da Análise">
                  <Textarea value={formData.objective} onChange={(e) => set('objective', e.target.value)} rows={3} />
                </FormGroup>

                {companyJobRoles.length > 0 && (
                  <>
                    <SectionTitle>Funções Disponíveis na Empresa</SectionTitle>
                    <div className="space-y-3">
                      {companyJobRoles.map(r => {
                        const sector = companySectors.find(s => s.id === r.sectorId);
                        const isSelected = formData.name === r.name;
                        return (
                          <div
                            key={r.id}
                            className={`border rounded-xl p-4 flex justify-between items-start transition-colors ${isSelected ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-800 text-sm">{r.name}</p>
                                {r.active
                                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {r.cbo && <span className="stat-badge !text-[11px] !px-2 !py-0.5">CBO {r.cbo}</span>}
                                {sector && <span className="stat-badge !text-[11px] !px-2 !py-0.5 !bg-violet-50 !text-violet-600 !border-violet-200">{sector.name}</span>}
                              </div>
                              {r.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>}
                              {((r.epiIds?.length ?? 0) > 0 || (r.equipmentIds?.length ?? 0) > 0) && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(r.epiIds ?? []).map(eid => { const e = epis.find(x => x.id === eid); return e ? (
                                    <span key={eid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700">
                                      <Shield className="w-2.5 h-2.5" />{e.name}
                                    </span>
                                  ) : null; })}
                                  {(r.equipmentIds ?? []).map(eid => { const e = equipment.find(x => x.id === eid); return e ? (
                                    <span key={eid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700">
                                      <Wrench className="w-2.5 h-2.5" />{e.name}
                                    </span>
                                  ) : null; })}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 shrink-0">
                              <Button
                                variant={isSelected ? 'default' : 'ghost'}
                                size="sm"
                                className="!rounded-lg"
                                onClick={() => handleApplyJobRole(r.id)}
                              >
                                {isSelected ? 'Selecionado' : 'Selecionar'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

              </div>
            );
          })()}

          {/* ── Tab 1: Organização do Trabalho ────────────────────────────── */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <SectionTitle>Turnos e Jornada</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  <FormGroup label="Turnos de Trabalho">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {shifts.filter(s => s.active).map(s => {
                        const selected = (formData.shifts || '').split(', ').includes(s.name);
                        return (
                          <label key={s.id} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                            <Checkbox 
                              checked={selected}
                              onChange={() => {
                                const current = (formData.shifts || '').split(', ').filter(Boolean);
                                const next = selected ? current.filter(v => v !== s.name) : [...current, s.name];
                                set('shifts', next.join(', '));
                              }}
                            />
                            {s.name}
                          </label>
                        );
                      })}
                      <button 
                        type="button"
                        onClick={() => setShowNewShiftInput(!showNewShiftInput)}
                        className={`flex items-center gap-2 px-3 py-1.5 border border-dashed rounded-xl text-sm transition-all ${showNewShiftInput ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-600'}`}
                      >
                        <Plus className="w-4 h-4" />
                        {showNewShiftInput ? 'Cancelar' : 'Novo Turno'}
                      </button>
                    </div>
                    {showNewShiftInput && (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input 
                          placeholder="Nome do novo turno..." 
                          value={newShiftName} 
                          onChange={e => setNewShiftName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddQuickShift())}
                        />
                        <Button type="button" onClick={handleAddQuickShift}>Adicionar</Button>
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Resumo / Customizado</p>
                      <Input 
                        value={formData.shifts} 
                        onChange={(e) => set('shifts', e.target.value)} 
                        placeholder="Ex: Turno Diurno, Turno Noturno" 
                      />
                    </div>
                  </FormGroup>
                </div>
                <FormGroup label="Horário Inicial">
                  <Input type="time" value={formData.shiftStart} onChange={(e) => set('shiftStart', e.target.value)} />
                </FormGroup>
                <FormGroup label="Horário Final">
                  <Input type="time" value={formData.shiftEnd} onChange={(e) => set('shiftEnd', e.target.value)} />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Dias da Semana">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(() => {
                      const allSelected = DAYS_OF_WEEK.every(day => (formData.workDays || '').includes(day));
                      return (
                        <label className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${allSelected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <Checkbox 
                            checked={allSelected}
                            onChange={() => {
                              if (allSelected) set('workDays', '');
                              else set('workDays', DAYS_OF_WEEK.join(', '));
                            }}
                          />
                          Todos
                        </label>
                      );
                    })()}
                    {DAYS_OF_WEEK.map(day => {
                      const selected = (formData.workDays || '').includes(day);
                      return (
                        <label key={day} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <Checkbox 
                            checked={selected}
                            onChange={() => {
                              const current = (formData.workDays || '').split(', ').filter(Boolean);
                              let next;
                              if (selected) {
                                next = current.filter(v => v !== day);
                              } else {
                                // Keep order if possible
                                next = [...current, day].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
                              }
                              set('workDays', next.join(', '));
                            }}
                          />
                          {day}
                        </label>
                      );
                    })}
                  </div>
                  <Input 
                    value={formData.workDays} 
                    onChange={(e) => set('workDays', e.target.value)} 
                    placeholder="Ex: Seg, Ter, Qua, Qui, Sex" 
                  />
                </FormGroup>
                <RadioGroup
                  label="Horas Extras"
                  name="overtime"
                  value={formData.overtime}
                  options={[
                    { value: 'Sim', label: 'Sim' },
                    { value: 'Não', label: 'Não' },
                    { value: 'Eventualmente', label: 'Eventualmente' },
                  ]}
                  onChange={(v) => set('overtime', v)}
                />
              </div>

              <SectionTitle>Pausas e Organização</SectionTitle>
              <FormGroup label="Pausas Eletivas">
                {pauses.filter(p => p.active).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {pauses.filter(p => p.active).map(p => {
                      const label = p.duration ? `${p.name} (${p.duration} ${p.durationUnit})` : p.name;
                      const selected = (formData.pauses || '').includes(p.name);
                      return (
                        <label key={p.id} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <Checkbox
                            checked={selected}
                            onChange={() => {
                              const cur = (formData.pauses || '').split(', ').filter(Boolean);
                              const nxt = selected ? cur.filter(v => v !== p.name) : [...cur, label];
                              set('pauses', nxt.join(', '));
                            }}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                )}
                <Textarea value={formData.pauses} onChange={(e) => set('pauses', e.target.value)} rows={2} placeholder="Descreva as pausas disponíveis" />
              </FormGroup>
              <RadioGroup
                label="Rodízio de Tarefas"
                name="taskRotation"
                value={formData.taskRotation}
                options={[
                  { value: 'Sim', label: 'Sim' },
                  { value: 'Não', label: 'Não' },
                  { value: 'Parcialmente', label: 'Parcialmente' },
                ]}
                onChange={(v) => set('taskRotation', v)}
              />
              <FormGroup label="Hierarquia / Organograma">
                <Textarea value={formData.hierarchyOrganogram} onChange={(e) => set('hierarchyOrganogram', e.target.value)} rows={2} placeholder="Descreva a hierarquia do setor" />
              </FormGroup>

              <SectionTitle>Condições Sanitárias</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Distância do Banheiro">
                  <Input value={formData.bathroomDistance} onChange={(e) => set('bathroomDistance', e.target.value)} placeholder="Ex: menos de 50 m" />
                </FormGroup>
                <RadioGroup
                  label="Condição do Banheiro/Refeitório/Bebedouro"
                  name="bathroomCondition"
                  value={formData.bathroomCondition}
                  options={[
                    { value: 'Adequada', label: 'Adequada' },
                    { value: 'Regular', label: 'Regular' },
                    { value: 'Inadequada', label: 'Inadequada' },
                  ]}
                  onChange={(v) => set('bathroomCondition', v)}
                />
              </div>

              <SectionTitle>Fotos – Banheiros / Refeitórios</SectionTitle>
              <ImageUpload
                images={formData.images}
                onChange={(imgs: AETImage[]) => set('images', imgs)}
                category="bathroom"
              />
            </div>
          )}

          {/* ── Tab 2: Perfil e Entrevista ─────────────────────────────────── */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <SectionTitle>Perfil do Trabalhador</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Formação / Qualificação">
                  <Input value={formData.collabFormation} onChange={(e) => set('collabFormation', e.target.value)} />
                </FormGroup>
                <FormGroup label="Turno Entrevistado">
                  <Select value={formData.collabTurn} onChange={(e) => set('collabTurn', e.target.value)}>
                    <option value="">Selecione...</option>
                    {shifts.filter(s => s.active).map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    {formData.collabTurn && !shifts.some(s => s.name === formData.collabTurn) && (
                      <option value={formData.collabTurn}>{formData.collabTurn}</option>
                    )}
                  </Select>
                </FormGroup>
                <FormGroup label="Gênero predominante">
                  <Select value={formData.opinionGender} onChange={(e) => set('opinionGender', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Misto">Misto</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Faixa Etária">
                  <Select value={formData.opinionAge} onChange={(e) => set('opinionAge', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Menor de 18 anos">Menor de 18 anos</option>
                    <option value="18 a 30 anos">18 a 30 anos</option>
                    <option value="31 a 45 anos">31 a 45 anos</option>
                    <option value="46 a 60 anos">46 a 60 anos</option>
                    <option value="Maior de 60 anos">Maior de 60 anos</option>
                    <option value="Variada (múltiplas faixas)">Variada (múltiplas faixas)</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Tempo Médio na Empresa">
                  <Input value={formData.opinionTime} onChange={(e) => set('opinionTime', e.target.value)} placeholder="Ex: 3 anos" />
                </FormGroup>
              </div>

              <SectionTitle>Questionário do Trabalhador</SectionTitle>

              {/* Perguntas já adicionadas */}
              {(formData.checklistAnswers || []).length > 0 && (
                <div className="space-y-3 mb-4">
                  {(formData.checklistAnswers || []).map((ans) => {
                    const q = surveyQuestions.find(sq => sq.id === ans.questionId);
                    if (!q) return null;
                    const currentAnswer = (ans as any).answer ?? '';
                    const setAnswer = (value: string) => {
                      const next = (formData.checklistAnswers || []).map(a =>
                        a.questionId === q.id ? { ...a, answer: value as any } : a
                      );
                      set('checklistAnswers', next);
                    };
                    const removeAnswer = () => {
                      set('checklistAnswers', (formData.checklistAnswers || []).filter(a => a.questionId !== q.id));
                    };

                    return (
                      <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 relative hover:border-teal-200 transition-colors">
                        <button
                          type="button"
                          onClick={removeAnswer}
                          className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remover pergunta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {(q.responseType === 'sim_nao' || q.responseType === 'sim/nao') ? (
                          <RadioGroup
                            label={q.question}
                            name={`sq_${q.id}`}
                            value={currentAnswer}
                            options={[
                              { value: 'sim', label: 'Sim' },
                              { value: 'nao', label: 'Não' },
                              { value: 'nao_se_aplica', label: 'N/A' },
                            ]}
                            onChange={setAnswer}
                          />
                        ) : (q.responseType === 'multipla_escolha' || q.responseType === 'multipla escolha') ? (
                          (() => {
                            const opts = (q as any).options as string[] | undefined;
                            return opts && opts.length > 0 ? (
                              <RadioGroup
                                label={q.question}
                                name={`sq_${q.id}`}
                                value={currentAnswer}
                                options={opts.map(o => ({ value: o, label: o }))}
                                onChange={setAnswer}
                              />
                            ) : (
                              <FormGroup label={q.question}>
                                <Input value={currentAnswer} onChange={e => setAnswer(e.target.value)} />
                              </FormGroup>
                            );
                          })()
                        ) : (q.responseType === 'texto_longo' || q.responseType === 'texto longo') ? (
                          <FormGroup label={q.question}>
                            <Textarea value={currentAnswer} onChange={e => setAnswer(e.target.value)} rows={3} />
                          </FormGroup>
                        ) : (
                          <FormGroup label={q.question}>
                            <Input value={currentAnswer} onChange={e => setAnswer(e.target.value)} />
                          </FormGroup>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Adicionar pergunta */}
              {(() => {
                const usedIds = new Set((formData.checklistAnswers || []).map(a => a.questionId));
                const available = surveyQuestions.filter(q => q.active && !usedIds.has(q.id)).sort((a, b) => a.order - b.order);
                if (available.length === 0 && (formData.checklistAnswers || []).length === 0) {
                  return (
                    <div className="empty-state !py-10">
                      <p className="text-slate-400 text-sm">Nenhuma pergunta cadastrada. Acesse <strong>Parâmetros › Questionário</strong> para adicionar perguntas.</p>
                    </div>
                  );
                }
                if (available.length === 0) return null;
                return (
                  <div className="flex items-center gap-3 border border-dashed border-slate-300 rounded-xl p-3 bg-white hover:border-teal-400 transition-colors">
                    <Plus className="w-4 h-4 text-teal-500 shrink-0" />
                    <select
                      className="flex-1 text-sm text-slate-600 bg-transparent border-none outline-none cursor-pointer"
                      value=""
                      onChange={e => {
                        const qId = e.target.value;
                        if (!qId) return;
                        const prev = formData.checklistAnswers || [];
                        if (prev.find(a => a.questionId === qId)) return;
                        set('checklistAnswers', [...prev, { questionId: qId, answer: '' as any }]);
                      }}
                    >
                      <option value="">+ Adicionar pergunta ao questionário...</option>
                      {available.map(q => (
                        <option key={q.id} value={q.id}>{q.question}</option>
                      ))}
                    </select>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Tab 3: Atividade e Ambiente ────────────────────────────────── */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <SectionTitle>Descrição do Local e Ambiente</SectionTitle>
              <FormGroup label="Descrição física do posto / ambiente">
                <Textarea value={formData.workspaceDescription} onChange={(e) => set('workspaceDescription', e.target.value)} rows={4} placeholder="Ambiente físico, ventilação, layout, iluminação natural/artificial, características relevantes do posto..." />
              </FormGroup>

              <SectionTitle>Dimensão da Produção / Atividade Realizada</SectionTitle>
              <FormGroup label="Como a atividade acontece">
                <Textarea value={formData.productionDimension} onChange={(e) => set('productionDimension', e.target.value)} rows={3} placeholder="Descreva o funcionamento da atividade, variações conforme demanda, avaliação de qualidade..." />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <RadioGroup
                  label="Existência de Metas"
                  name="productionGoals"
                  value={formData.productionGoals}
                  options={[
                    { value: 'Sim', label: 'Sim' },
                    { value: 'Não', label: 'Não' },
                    { value: 'Informais', label: 'Informais' },
                  ]}
                  onChange={(v) => set('productionGoals', v)}
                />
                <FormGroup label="Quem avalia o trabalho executado">
                  <Input value={formData.qualityEvaluator} onChange={(e) => set('qualityEvaluator', e.target.value)} />
                </FormGroup>
              </div>
              <FormGroup label="Forma de controle de qualidade">
                <Textarea value={formData.qualityAnalysis} onChange={(e) => set('qualityAnalysis', e.target.value)} rows={2} />
              </FormGroup>

              <SectionTitle>Exigências do Trabalho</SectionTitle>
              <FormGroup label="Esforços Dinâmicos">
                <Textarea value={formData.effortDynamic} onChange={(e) => set('effortDynamic', e.target.value)} rows={3} placeholder="Movimentos repetitivos, deslocamentos, extensões de membros..." />
              </FormGroup>
              <FormGroup label="Esforços Estáticos">
                <Textarea value={formData.effortStatic} onChange={(e) => set('effortStatic', e.target.value)} rows={3} placeholder="Posturas mantidas, contrações musculares isométricas..." />
              </FormGroup>

              <SectionTitle>Cronoanálise</SectionTitle>
              <FormGroup label="Distribuição do tempo e rotina">
                <Textarea value={formData.timeAnalysis} onChange={(e) => set('timeAnalysis', e.target.value)} rows={3} placeholder="Explique a rotina, distribuição estimada do tempo, variações da atividade..." />
              </FormGroup>

              <SectionTitle>Carregamento de Peso</SectionTitle>
              <FormGroup label="Descrição do carregamento manual">
                <Textarea value={formData.loadCarrying} onChange={(e) => set('loadCarrying', e.target.value)} rows={2} placeholder="Peso, frequência e modo de transporte, ou 'Não há carregamento manual'..." />
              </FormGroup>

              <SectionTitle>Deslocamentos</SectionTitle>
              <FormGroup label="Deambulação diária estimada">
                <Input value={formData.displacement} onChange={(e) => set('displacement', e.target.value)} placeholder="Ex: inferior a 2 km/dia ou entre 2 e 4 km/dia" />
              </FormGroup>

              <SectionTitle>Manutenção</SectionTitle>
              <FormGroup label="Como ocorre a manutenção dos equipamentos">
                <Textarea value={formData.maintenanceDesc} onChange={(e) => set('maintenanceDesc', e.target.value)} rows={2} />
              </FormGroup>
              <RadioGroup
                label="A manutenção causa atraso no ciclo operacional?"
                name="maintenanceCausesDelay"
                value={formData.maintenanceCausesDelay}
                options={[
                  { value: 'Sim', label: 'Sim' },
                  { value: 'Não', label: 'Não' },
                  { value: 'Raramente', label: 'Raramente' },
                ]}
                onChange={(v) => set('maintenanceCausesDelay', v)}
              />

              <SectionTitle>Logística</SectionTitle>
              <RadioGroup
                label="A logística influencia a atividade?"
                name="logisticsInfluence"
                value={formData.logisticsInfluence}
                options={[
                  { value: 'Sim', label: 'Sim' },
                  { value: 'Não', label: 'Não' },
                ]}
                onChange={(v) => set('logisticsInfluence', v)}
              />
              <FormGroup label="Como a logística causa atraso (se aplicável)">
                <Input value={formData.logisticsDelay} onChange={(e) => set('logisticsDelay', e.target.value)} />
              </FormGroup>

              <SectionTitle>Retrabalho / Refugo</SectionTitle>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reworkNotApplicable}
                  onChange={(e) => set('reworkNotApplicable', e.target.checked)}
                />
                Não se aplica
              </label>
              {!formData.reworkNotApplicable && (
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Contexto do retrabalho">
                    <Textarea value={formData.reworkDesc} onChange={(e) => set('reworkDesc', e.target.value)} rows={2} />
                  </FormGroup>
                  <FormGroup label="Frequência semanal estimada">
                    <Input value={formData.reworkWeek} onChange={(e) => set('reworkWeek', e.target.value)} placeholder="Ex: 2 vezes/semana" />
                  </FormGroup>
                </div>
              )}

              <SectionTitle>Modo Operatório / Ciclo Operacional</SectionTitle>
              <FormGroup label="Tarefa Prescrita">
                <Input value={formData.cyclePrescribed} onChange={(e) => set('cyclePrescribed', e.target.value)} placeholder="VIDE PGR" />
              </FormGroup>
              <FormGroup label="Observação sistemática do ciclo operacional (tarefa real)">
                <Textarea value={formData.cycleReal} onChange={(e) => set('cycleReal', e.target.value)} rows={5} placeholder="Narrativa da atividade observada, sequência de execução, diferença entre prescrito e real..." />
              </FormGroup>

              <SectionTitle>Meio Ambiente de Trabalho</SectionTitle>
              <FormGroup label="Referência">
                <Input value={formData.meioAmbiente} onChange={(e) => set('meioAmbiente', e.target.value)} placeholder="Vide LTCAT / Vide PGR" />
              </FormGroup>

              <SectionTitle>Fotos – Posto de Trabalho</SectionTitle>
              <ImageUpload
                images={formData.images}
                onChange={(imgs: AETImage[]) => set('images', imgs)}
                category="workplace"
              />
            </div>
          )}

          {/* ── Tab 4: Equipamentos, EPIs e Posturas ──────────────────────── */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <SectionTitle>Lista de Equipamentos e Materiais</SectionTitle>
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    checked={!!formData.usesEquipment}
                    onChange={(e) => set('usesEquipment', e.target.checked)}
                  />
                  A função utiliza equipamentos?
                </label>
              </div>
              {formData.usesEquipment && (
                <div className="space-y-4 mb-8">
                  {(formData.equipmentList || []).map((eq, idx) => (
                <div key={eq.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3 relative hover:border-slate-300 transition-colors">
                  <button
                    type="button"
                    onClick={() => removeEquipment(idx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <p className="text-sm font-medium text-slate-500">Equipamento {idx + 1}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <FormGroup label="Nome">
                      <Select value={eq.name} onChange={(e) => updateEquipment(idx, 'name', e.target.value)}>
                        <option value="">Selecione...</option>
                        {equipment.filter(e => e.active).map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                        {eq.name && !equipment.some(e => e.name === eq.name) && (
                          <option value={eq.name}>{eq.name} (Não cadastrado)</option>
                        )}
                      </Select>
                    </FormGroup>
                    <FormGroup label="Quantidade">
                      <Input value={eq.quantity} onChange={(e) => updateEquipment(idx, 'quantity', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Dimensões">
                      <Input value={eq.dimensions} onChange={(e) => updateEquipment(idx, 'dimensions', e.target.value)} placeholder="Ex: 80x60x75 cm" />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Tipo de Funcionamento">
                      <Select value={eq.principle} onChange={(e) => updateEquipment(idx, 'principle', e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="manual">Manual</option>
                        <option value="eletrico">Elétrico</option>
                        <option value="hidraulico">Hidráulico</option>
                        <option value="pneumatico">Pneumático</option>
                      </Select>
                    </FormGroup>
                    <FormGroup label="Condição Aparente">
                      <Select value={eq.condition} onChange={(e) => updateEquipment(idx, 'condition', e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="Boa">Boa</option>
                        <option value="Regular">Regular</option>
                        <option value="Ruim">Ruim</option>
                      </Select>
                    </FormGroup>
                  </div>
                  <FormGroup label="Observações">
                    <Input value={eq.observations} onChange={(e) => updateEquipment(idx, 'observations', e.target.value)} />
                  </FormGroup>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addEquipment}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Equipamento
              </Button>

              <FormGroup label="Problemas Aparentes Gerais">
                <Textarea value={formData.equipProblems} onChange={(e) => set('equipProblems', e.target.value)} rows={2} />
              </FormGroup>
              </div>
              )}

              <SectionTitle>Lista de EPIs</SectionTitle>
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    checked={!!formData.usesEPI}
                    onChange={(e) => set('usesEPI', e.target.checked)}
                  />
                  A função utiliza EPIs?
                </label>
              </div>
              {formData.usesEPI && (
                <div className="space-y-4 mb-8">
                  {(formData.epiList || []).map((epi, idx) => (
                <div key={epi.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3 relative hover:border-slate-300 transition-colors">
                  <button
                    type="button"
                    onClick={() => removeEPI(idx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <p className="text-sm font-medium text-slate-500">EPI {idx + 1}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <FormGroup label="Nome do EPI">
                      <Select value={epi.name} onChange={(e) => updateEPI(idx, 'name', e.target.value)}>
                        <option value="">Selecione...</option>
                        {epis.filter(e => e.active).map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                        {epi.name && !epis.some(e => e.name === epi.name) && (
                          <option value={epi.name}>{epi.name} (Não cadastrado)</option>
                        )}
                      </Select>
                    </FormGroup>
                    <FormGroup label="Local de Uso">
                      <Input value={epi.location} onChange={(e) => updateEPI(idx, 'location', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Observações">
                      <Input value={epi.observations} onChange={(e) => updateEPI(idx, 'observations', e.target.value)} />
                    </FormGroup>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={epi.mandatory}
                        onChange={(e) => updateEPI(idx, 'mandatory', e.target.checked)}
                      />
                      Uso Obrigatório
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={epi.occasional}
                        onChange={(e) => updateEPI(idx, 'occasional', e.target.checked)}
                      />
                      Uso Eventual
                    </label>
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addEPI}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar EPI
              </Button>
              </div>
              )}

              <SectionTitle>Predominância Postural</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                <FormGroup label="Sentado (%)">
                  <Input type="number" min="0" max="100" value={formData.postureSittingPct} onChange={(e) => set('postureSittingPct', Number(e.target.value))} />
                </FormGroup>
                <FormGroup label="Em Pé (%)">
                  <Input type="number" min="0" max="100" value={formData.postureStandingPct} onChange={(e) => set('postureStandingPct', Number(e.target.value))} />
                </FormGroup>
                <FormGroup label="Andando (%)">
                  <Input type="number" min="0" max="100" value={formData.postureWalkingPct} onChange={(e) => set('postureWalkingPct', Number(e.target.value))} />
                </FormGroup>
                <FormGroup label="Agachado (%)">
                  <Input type="number" min="0" max="100" value={formData.postureCrouchingPct} onChange={(e) => set('postureCrouchingPct', Number(e.target.value))} />
                </FormGroup>
                <FormGroup label="Outro (%)">
                  <Input type="number" min="0" max="100" value={formData.postureOtherPct} onChange={(e) => set('postureOtherPct', Number(e.target.value))} />
                </FormGroup>
                <FormGroup label="Descrição do 'Outro'">
                  <Input value={formData.postureOtherDescription} onChange={(e) => set('postureOtherDescription', e.target.value)} />
                </FormGroup>
              </div>
              {(() => {
                const total = (formData.postureSittingPct || 0) + (formData.postureStandingPct || 0) + (formData.postureWalkingPct || 0) + (formData.postureCrouchingPct || 0) + (formData.postureOtherPct || 0);
                return total !== 0 && total !== 100 ? (
                  <p className="text-amber-600 text-sm font-medium">Atenção: o total postural é {total}% (deve somar 100%).</p>
                ) : null;
              })()}

              <SectionTitle>Fotos – Equipamentos</SectionTitle>
              <ImageUpload
                images={formData.images}
                onChange={(imgs: AETImage[]) => set('images', imgs)}
                category="equipment"
              />

              <SectionTitle>Fotos – Posturas</SectionTitle>
              <ImageUpload
                images={formData.images}
                onChange={(imgs: AETImage[]) => set('images', imgs)}
                category="posture"
              />
            </div>
          )}

          {/* ── Tab 5: Iluminação NHO 11 ───────────────────────────────────── */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <SectionTitle>Identificação</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Local Avaliado">
                  <Input value={formData.illumination.location} onChange={(e) => setIllum('location', e.target.value)} />
                </FormGroup>
                <FormGroup label="Data da Medição">
                  <Input type="date" value={formData.illumination.date} onChange={(e) => setIllum('date', e.target.value)} />
                </FormGroup>
                <FormGroup label="Tipo de Iluminação">
                  <Select value={formData.illumination.lightingType} onChange={(e) => setIllum('lightingType', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Natural">Natural</option>
                    <option value="Artificial">Artificial</option>
                    <option value="Mista">Mista (Natural + Artificial)</option>
                  </Select>
                </FormGroup>
              </div>

              <SectionTitle>Pontos de Medição NHO 11</SectionTitle>
              <FormGroup label="Modelo de Medição">
                <Select
                  value={nhoModelType}
                  onChange={(e) => handleModelTypeChange(e.target.value as NHO11ModelType)}
                >
                  <option value="SIMPLE_AVERAGE">Média Simples (E_med = Σ(Ei) / n)</option>
                  <option value="RECTANGULAR_REGULAR_GRID">Grade Retangular Regular</option>
                  <option value="RECTANGULAR_SINGLE_LINE">Linha Única Retangular</option>
                  <option value="CENTRAL_LUMINAIRE">Luminária Central</option>
                  <option value="OUTDOOR_NOT_APPLICABLE">Ambiente Externo (não aplicável)</option>
                </Select>
              </FormGroup>

              {nhoModelType === 'OUTDOOR_NOT_APPLICABLE' ? (
                <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-500">
                    Ambiente externo selecionado — a metodologia NHO 11 não se aplica. Medições em ambientes externos são variáveis e dependentes de condições climáticas e sazonais.
                  </p>
                </div>
              ) : (
                <>
                  <FormGroup label="Valor de Referência (lux)">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        value={formData.illumination.referenceLux || ''}
                        onChange={(e) => setRefLux(Number(e.target.value))}
                        placeholder="Ex: 500"
                        className="w-36"
                      />
                      <span className="text-xs text-slate-500">Conforme NBR ISO/CIE 8995-1 para o tipo de atividade</span>
                    </div>
                  </FormGroup>

                  {(formData.illumination.measurementPoints || []).length === 0 && (
                    <div className="empty-state !py-6">
                      <p className="text-slate-400 text-sm">Nenhum ponto adicionado. Clique em "Adicionar Ponto" para registrar as medições.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(formData.illumination.measurementPoints || []).map((pt, idx) => (
                      <div key={pt.id} className="flex items-end gap-3 border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:border-slate-300 transition-colors">
                        <span className="text-xs font-bold text-slate-400 mb-2 w-5 shrink-0">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Identificação do ponto</p>
                          <Input
                            value={pt.label}
                            onChange={(e) => updateMeasurementPoint(idx, 'label', e.target.value)}
                            placeholder="Ex: Centro do posto, Bancada lateral..."
                          />
                        </div>
                        <div className="w-32 shrink-0">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Lux</p>
                          <Input
                            type="number"
                            min="0"
                            value={pt.lux === 0 ? '' : pt.lux}
                            onChange={(e) => updateMeasurementPoint(idx, 'lux', Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMeasurementPoint(idx)}
                          className="text-red-400 hover:text-red-600 cursor-pointer transition-colors mb-1 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button type="button" variant="secondary" onClick={addMeasurementPoint}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Ponto de Medição
                  </Button>
                </>
              )}

              {nhoResult && (
                <>
                  <SectionTitle>Resultado Calculado (NHO 11)</SectionTitle>
                  <div className="border border-teal-200 rounded-xl p-5 bg-teal-50/30">
                    {nhoResult.conclusion === 'não_aplicável' ? (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-slate-600 mb-1">Não Aplicável — Ambiente Externo</p>
                          <p className="text-sm text-slate-500">{nhoResult.interpretationText}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">E_med (média)</p>
                            <p className="text-xl font-bold text-slate-800">{nhoResult.averageLux} <span className="text-sm font-normal text-slate-500">lux</span></p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Mín / Máx</p>
                            <p className="text-xl font-bold text-slate-800">{nhoResult.minMeasuredLux} / {nhoResult.maxMeasuredLux} <span className="text-sm font-normal text-slate-500">lux</span></p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Relação max/min</p>
                            <p className="text-xl font-bold text-slate-800">{nhoResult.ratioMaxMin}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Limiar mínimo (90%)</p>
                            <p className="text-xl font-bold text-slate-800">{nhoResult.tolerance10Percent} <span className="text-sm font-normal text-slate-500">lux</span></p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">70% da média</p>
                            <p className="text-xl font-bold text-slate-800">{nhoResult.seventyPercentAverage} <span className="text-sm font-normal text-slate-500">lux</span></p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Conclusão</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              nhoResult.conclusion === 'adequada'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {nhoResult.conclusion === 'adequada' ? 'ADEQUADA' : 'INADEQUADA'}
                            </span>
                          </div>
                        </div>
                        {nhoResult.conclusion === 'inadequada' && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                              Iluminância abaixo do limiar mínimo. Adicione um item ao checklist abaixo com a ação corretiva e o responsável.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              <SectionTitle>Resultado e Conclusão</SectionTitle>
              <RadioGroup
                label="Conclusão"
                name="illuminationConclusion"
                value={formData.illumination.conclusion}
                options={[
                  { value: 'adequada',      label: 'Iluminação Adequada' },
                  { value: 'inadequada',    label: 'Iluminação Inadequada' },
                  { value: 'não_aplicável', label: 'Não Aplicável' },
                ]}
                onChange={(v) => setIllum('conclusion', v)}
              />
              <FormGroup label="Interpretação dos resultados">
                <Textarea value={formData.illumination.interpretation} onChange={(e) => setIllum('interpretation', e.target.value)} rows={3} />
              </FormGroup>
              <FormGroup label="Texto da conclusão">
                <Textarea value={formData.illumination.conclusionText} onChange={(e) => setIllum('conclusionText', e.target.value)} rows={2} />
              </FormGroup>

              <SectionTitle>Dados Complementares</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                <FormGroup label="Valor Medido (lux)">
                  <Input value={formData.illumination.resultLux} onChange={(e) => setIllum('resultLux', e.target.value)} placeholder="Preenchido automaticamente" />
                </FormGroup>
                <FormGroup label="Referência Normativa (texto)">
                  <Input value={formData.illumination.referenceValue} onChange={(e) => setIllum('referenceValue', e.target.value)} placeholder="Ex: 500 lux (NBR ISO/CIE 8995-1)" />
                </FormGroup>
                <FormGroup label="Fórmula utilizada">
                  <Input value={formData.illumination.formula} onChange={(e) => setIllum('formula', e.target.value)} />
                </FormGroup>
              </div>

              <SectionTitle>Contexto da Avaliação</SectionTitle>
              <FormGroup label="Descrição do Ambiente">
                <Textarea value={formData.illumination.environmentDescription} onChange={(e) => setIllum('environmentDescription', e.target.value)} rows={2} />
              </FormGroup>
              <FormGroup label="Sistema de Iluminação">
                <Input value={formData.illumination.lightingSystem} onChange={(e) => setIllum('lightingSystem', e.target.value)} placeholder="Ex: Fluorescente T8, LED..." />
              </FormGroup>
              <FormGroup label="Atividades / Tarefas realizadas no local">
                <Textarea value={formData.illumination.activities} onChange={(e) => setIllum('activities', e.target.value)} rows={2} />
              </FormGroup>
              <FormGroup label="Referência Normativa">
                <Input value={formData.illumination.normativeReference} onChange={(e) => setIllum('normativeReference', e.target.value)} />
              </FormGroup>

              <SectionTitle>Checklist de Iluminação (NHO 11)</SectionTitle>
              {(formData.illumination.checklist || []).map((item, idx) => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3 relative hover:border-slate-300 transition-colors">
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(idx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <FormGroup label="Descrição do item">
                    <Input value={item.description} onChange={(e) => updateChecklistItem(idx, 'description', e.target.value)} />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Conforme?</p>
                      <div className="flex gap-2">
                        {[{ v: 'sim', l: 'Sim' }, { v: 'nao', l: 'Não' }].map((opt) => (
                          <label key={opt.v} className={`cursor-pointer px-3 py-1 border rounded-full text-sm ${item.compliant === opt.v ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                            <input type="radio" className="hidden" checked={item.compliant === opt.v} onChange={() => updateChecklistItem(idx, 'compliant', opt.v)} />
                            {opt.l}
                          </label>
                        ))}
                      </div>
                    </div>
                    <FormGroup label="Prazo">
                      <Input value={item.deadline} onChange={(e) => updateChecklistItem(idx, 'deadline', e.target.value)} />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Ação Recomendada">
                      <Input value={item.recommendedAction} onChange={(e) => updateChecklistItem(idx, 'recommendedAction', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Responsável">
                      <Input value={item.responsible} onChange={(e) => updateChecklistItem(idx, 'responsible', e.target.value)} />
                    </FormGroup>
                  </div>
                  <FormGroup label="Observações">
                    <Input value={item.observations} onChange={(e) => updateChecklistItem(idx, 'observations', e.target.value)} />
                  </FormGroup>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addChecklistItem}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Item ao Checklist
              </Button>
            </div>
          )}

          {/* ── Tab 6: Métodos Ergonômicos ─────────────────────────────────── */}
          {activeTab === 6 && (
            <div className="space-y-4">
              <SectionTitle>Métodos Científicos Aplicados</SectionTitle>
              {(formData.scientificMethods || []).map((m, idx) => (
                <div key={m.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3 relative hover:border-slate-300 transition-colors">
                  <button
                    type="button"
                    onClick={() => removeMethod(idx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Método Aplicado">
                      <Select
                        value={m.methodName}
                        onChange={(e) => {
                          const selected = scientificMethodTemplates.find(t => t.name === e.target.value);
                          updateMethod(idx, 'methodName', e.target.value);
                          if (selected) {
                            updateMethod(idx, 'description', selected.description);
                          }
                        }}
                      >
                        <option value="">Selecione...</option>
                        {scientificMethodTemplates.length > 0 && (
                          <optgroup label="Métodos Cadastrados">
                            {scientificMethodTemplates.map(t => (
                              <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Outros">
                          <option value="RULA">RULA</option>
                          <option value="REBA">REBA</option>
                          <option value="NIOSH">NIOSH</option>
                          <option value="OWAS">OWAS</option>
                          <option value="OCRA">OCRA</option>
                          <option value="JSI">JSI (Job Strain Index)</option>
                          <option value="Outro">Outro</option>
                        </optgroup>
                      </Select>
                    </FormGroup>
                    <FormGroup label="Pontuação / Resultado">
                      <Input value={m.result} onChange={(e) => updateMethod(idx, 'result', e.target.value)} placeholder="Ex: 5" />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Cor / Classificação">
                      <Select value={m.riskClassification} onChange={(e) => updateMethod(idx, 'riskClassification', e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="Verde – Risco Aceitável">Verde – Risco Aceitável</option>
                        <option value="Amarelo – Risco Moderado">Amarelo – Risco Moderado</option>
                        <option value="Laranja – Risco Substancial">Laranja – Risco Substancial</option>
                        <option value="Vermelho – Risco Alto">Vermelho – Risco Alto</option>
                      </Select>
                    </FormGroup>
                  </div>
                  <FormGroup label="Interpretação técnica do resultado">
                    <Textarea value={m.interpretation} onChange={(e) => updateMethod(idx, 'interpretation', e.target.value)} rows={3} placeholder="Explique tecnicamente o significado do resultado para esta função..." />
                  </FormGroup>
                  <FormGroup label="Descrição conceitual do método">
                    <Textarea value={m.description} onChange={(e) => updateMethod(idx, 'description', e.target.value)} rows={2} />
                  </FormGroup>
                  <FormGroup label="Recomendações">
                    <Textarea value={m.recommendations} onChange={(e) => updateMethod(idx, 'recommendations', e.target.value)} rows={2} />
                  </FormGroup>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addMethod}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Método
              </Button>

              <SectionTitle>Fotos – Métodos Científicos</SectionTitle>
              <ImageUpload
                images={formData.images}
                onChange={(imgs: AETImage[]) => set('images', imgs)}
                category="method"
              />

              <SectionTitle>Checklist de Verificação</SectionTitle>
              {checklistQuestions.filter((q) => q.functionIds?.includes(funcId!)).length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma pergunta de checklist vinculada a esta função. Configure em Parâmetros → Checklist.</p>
              ) : (
                <div className="space-y-3">
                  {checklistQuestions.filter((q) => q.functionIds?.includes(funcId!)).map((q) => {
                    const answerObj = formData.checklistAnswers?.find((a) => a.questionId === q.id) || { questionId: q.id, answer: '' };
                    return (
                      <div key={q.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <span className="font-medium flex-1 text-sm">{q.text}</span>
                        <div className="flex gap-2">
                          {['sim', 'nao', 'nao_se_aplica'].map((val) => (
                            <label key={val} className={`cursor-pointer px-3 py-1 border rounded-full text-xs transition-colors ${answerObj.answer === val ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                              <input
                                type="radio"
                                name={`chk_${q.id}`}
                                className="hidden"
                                checked={answerObj.answer === val}
                                onChange={() => {
                                  let newAnswers = formData.checklistAnswers ? [...formData.checklistAnswers] : [];
                                  const i = newAnswers.findIndex((a) => a.questionId === q.id);
                                  if (i >= 0) newAnswers[i].answer = val as any;
                                  else newAnswers.push({ questionId: q.id, answer: val as any });
                                  set('checklistAnswers', newAnswers);
                                }}
                              />
                              {val === 'sim' ? 'Sim' : val === 'nao' ? 'Não' : 'N/A'}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Tab 7: Riscos e Melhorias ──────────────────────────────────── */}
          {activeTab === 7 && (
            <div className="space-y-4">

              {/* ── Inventário novo (ErgonomicRisk) ── */}
              <SectionTitle>Inventário de Risco Ergonômico</SectionTitle>

              {(formData.risks || []).length === 0 && (
                <div className="empty-state !py-8">
                  <p className="text-slate-400 text-sm">Nenhum risco cadastrado. Clique em "Adicionar risco" para começar.</p>
                </div>
              )}

              {(formData.risks || []).map((risk, idx) => {
                const levelColors: Record<string, string> = {
                  'BAIXO':      'bg-green-100 text-green-700 border-green-300',
                  'MODERADO':   'bg-yellow-100 text-yellow-700 border-yellow-300',
                  'ALTO RISCO': 'bg-orange-100 text-orange-700 border-orange-300',
                  'CRÍTICO':    'bg-red-100 text-red-700 border-red-300',
                };
                const levelCls = levelColors[risk.riskLevel] ?? 'bg-slate-100 text-slate-600 border-slate-300';

                return (
                  <div key={risk.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3 relative hover:border-slate-300 transition-colors">
                    <button
                      type="button"
                      onClick={() => removeRisk(idx)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-slate-600">Risco {String(idx + 1).padStart(2, '0')}</p>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${levelCls}`}>
                        {risk.riskLevel} — Score {risk.score}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormGroup label="Agente de Risco">
                        <Input value={risk.agent} onChange={e => updateRisk(idx, 'agent', e.target.value)} placeholder="Ex: Postura inadequada" />
                      </FormGroup>
                      <FormGroup label="Fator de Risco">
                        <Input value={risk.riskFactor} onChange={e => updateRisk(idx, 'riskFactor', e.target.value)} placeholder="Ex: Flexão de tronco frequente" />
                      </FormGroup>
                    </div>

                    <FormGroup label="Possível Agravo à Saúde">
                      <Input value={risk.possibleHealthEffect} onChange={e => updateRisk(idx, 'possibleHealthEffect', e.target.value)} placeholder="Ex: LER/DORT, lombalgia" />
                    </FormGroup>

                    <FormGroup label="Situação Encontrada">
                      <Textarea value={risk.foundSituation} onChange={e => updateRisk(idx, 'foundSituation', e.target.value)} rows={2} placeholder="Descreva o que foi observado no posto de trabalho..." />
                    </FormGroup>

                    <div className="grid grid-cols-2 gap-3">
                      <FormGroup label="Controle Existente">
                        <Textarea value={risk.existingControl} onChange={e => updateRisk(idx, 'existingControl', e.target.value)} rows={2} placeholder="Medidas já adotadas pela empresa..." />
                      </FormGroup>
                      <FormGroup label="Proposta de Melhoria">
                        <Textarea value={risk.improvementProposal} onChange={e => updateRisk(idx, 'improvementProposal', e.target.value)} rows={2} placeholder="Ações recomendadas..." />
                      </FormGroup>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-end">
                      <FormGroup label="Probabilidade (1–5)">
                        <Select
                          value={String(risk.probability)}
                          onChange={e => updateRisk(idx, 'probability', Number(e.target.value))}
                        >
                          <option value="1">1 – Improvável</option>
                          <option value="2">2 – Possível</option>
                          <option value="3">3 – Provável</option>
                          <option value="4">4 – Frequente</option>
                          <option value="5">5 – Muito Frequente</option>
                        </Select>
                      </FormGroup>
                      <FormGroup label="Gravidade (1–5)">
                        <Select
                          value={String(risk.severity)}
                          onChange={e => updateRisk(idx, 'severity', Number(e.target.value))}
                        >
                          <option value="1">1 – Leve</option>
                          <option value="2">2 – Moderada</option>
                          <option value="3">3 – Grave</option>
                          <option value="4">4 – Muito Grave</option>
                          <option value="5">5 – Catastrófica</option>
                        </Select>
                      </FormGroup>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Score (P × G)</p>
                        <div className={`flex items-center justify-center h-10 rounded-xl border font-bold text-sm ${levelCls}`}>
                          {risk.score} — {risk.riskLevel}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <FormGroup label="Referência Normativa">
                        <Input value={risk.normativeReference} onChange={e => updateRisk(idx, 'normativeReference', e.target.value)} placeholder="Ex: NR-17, ISO 11228" />
                      </FormGroup>
                      <FormGroup label="Responsável">
                        <Input value={risk.responsible ?? ''} onChange={e => updateRisk(idx, 'responsible', e.target.value)} />
                      </FormGroup>
                      <FormGroup label="Prazo">
                        <Input type="date" value={risk.deadline ?? ''} onChange={e => updateRisk(idx, 'deadline', e.target.value)} />
                      </FormGroup>
                    </div>
                  </div>
                );
              })}

              <Button type="button" variant="secondary" onClick={addRisk}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Risco Ergonômico
              </Button>

              <SectionTitle>Fotos – Evidências de Risco</SectionTitle>
              <ImageUpload
                images={formData.images}
                onChange={(imgs: AETImage[]) => set('images', imgs)}
                category="risk_evidence"
              />

              {/* ── Seção legada (AETImprovement) ── */}
              {(formData.improvements || []).length > 0 && (
                <>
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-200 text-slate-500 rounded-full">Legado</span>
                      <p className="text-sm text-slate-400">Registros do formato anterior — migre para o novo inventário acima e depois remova.</p>
                    </div>
                    {(formData.improvements || []).map((imp, idx) => (
                      <div key={imp.id} className="border border-dashed border-slate-300 rounded-xl p-4 bg-white/60 space-y-3 relative mb-3 opacity-70">
                        <button type="button" onClick={() => removeImprovement(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <p className="text-xs font-semibold text-slate-500">Item legado {String(idx + 1).padStart(2, '0')} — {imp.hazard || '(sem perigo)'}</p>
                        <FormGroup label="Identificação do Perigo">
                          <Textarea value={imp.hazard} onChange={e => updateImprovement(idx, 'hazard', e.target.value)} rows={2} />
                        </FormGroup>
                        <div className="grid grid-cols-2 gap-3">
                          <FormGroup label="Responsável">
                            <Input value={imp.responsible} onChange={e => updateImprovement(idx, 'responsible', e.target.value)} />
                          </FormGroup>
                          <FormGroup label="Prazo">
                            <Input type="date" value={imp.deadline} onChange={e => updateImprovement(idx, 'deadline', e.target.value)} />
                          </FormGroup>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}

          {/* ── Tab 8: Diagnóstico Final ───────────────────────────────────── */}
          {activeTab === 8 && (
            <div className="space-y-4">
              <SectionTitle>Diagnóstico</SectionTitle>
              <p className="text-sm text-slate-500">
                Texto técnico conclusivo: aspectos positivos, autonomia, pausas, adequação dos equipamentos, relação interpessoal, adaptação às exigências e necessidade de melhorias.
              </p>
              <FormGroup label="Diagnóstico Técnico">
                <Textarea
                  value={formData.diagnosis}
                  onChange={(e) => set('diagnosis', e.target.value)}
                  rows={10}
                  placeholder="A análise ergonômica da função de [Nome] evidenciou que..."
                />
              </FormGroup>

              <SectionTitle>Classificação do Risco</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Nível de Risco (resultado geral)">
                  <Select value={formData.riskLevel} onChange={(e) => set('riskLevel', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Baixo / Tolerável">Baixo / Tolerável</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Substancial">Substancial</option>
                    <option value="Alto / Intolerável">Alto / Intolerável</option>
                  </Select>
                </FormGroup>
                <FormGroup label="RULA (resultado aplicado)">
                  <Select value={formData.rulaScore} onChange={(e) => set('rulaScore', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Verde – Aceitável">Verde – Aceitável</option>
                    <option value="Amarelo – Investigar">Amarelo – Investigar</option>
                    <option value="Laranja – Mudar em breve">Laranja – Mudar em breve</option>
                    <option value="Vermelho – Mudar Imediatamente">Vermelho – Mudar Imediatamente</option>
                  </Select>
                </FormGroup>
              </div>

              <SectionTitle>Outras Fotos</SectionTitle>
              <ImageUpload
                images={formData.images}
                onChange={(imgs: AETImage[]) => set('images', imgs)}
                category="other"
              />
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
          <Button variant="outline" onClick={handleSave} disabled={!canEdit} className="border-teal-600 text-teal-600 hover:bg-teal-50">
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
          {activeTab < TABS.length - 1 ? (
            <Button onClick={() => setActiveTab(t => t + 1)}>Próximo →</Button>
          ) : (
            <Button onClick={handleSave} disabled={!canEdit} className="!bg-teal-600 !text-white hover:!bg-teal-700">
              <Save className="w-4 h-4 mr-2" /> Salvar Função
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
