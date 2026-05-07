import React, { createContext, useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import {
  AETProject, AETFunction, ChecklistQuestion, ScientificMethodTemplate,
  Company, Unit, Sector, StandardJobRole, EPI, StandardEquipment,
  SurveyQuestion, StandardPause, RiskClassification, ReportTextTemplate, Shift,
  BiomechanicalRiskFactor,
} from '../types';
import type { IlluminanceNormativeParameter } from '../domain/illuminance/illuminanceTypes';
import { DEFAULT_NORMATIVE_PARAMETERS } from '../domain/illuminance/illuminanceTypes';
import { normalizeFunction, normalizeProject, normalizeProjectsOnLoad } from '../domain/normalize';
import { createMockAEPProject, createMockAETProject } from '../utils/mockData';
import { Client, MOCK_CLIENTS } from '../data/mockClients';
import {
  MOCK_COMPANIES, MOCK_UNITS, MOCK_SECTORS, MOCK_JOB_ROLES, MOCK_EPIS,
  MOCK_EQUIPMENT, MOCK_SURVEY_QUESTIONS, MOCK_PAUSES, MOCK_RISK_CLASSIFICATIONS,
  MOCK_REPORT_TEXTS, MOCK_CHECKLIST_QUESTIONS, MOCK_SCIENTIFIC_METHODS, MOCK_SHIFTS,
} from '../data/mockParameters';

interface AETContextType {
  projects: AETProject[];
  loading: boolean;
  addProject: (project: Omit<AETProject, 'id' | 'functions'>) => Promise<string>;
  updateProject: (id: string, project: Partial<AETProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => AETProject | undefined;
  addFunction: (projectId: string, func: Partial<AETFunction>) => Promise<string>;
  updateFunction: (projectId: string, functionId: string, func: Partial<AETFunction>) => Promise<void>;
  deleteFunction: (projectId: string, functionId: string) => Promise<void>;
  duplicateFunction: (projectId: string, functionId: string) => Promise<string>;
  exportProjectJSON: (projectId: string) => string | null;
  importProjectJSON: (json: string) => Promise<string | null>;
  resetDevelopmentData: () => Promise<void>;
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<string>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  checklistQuestions: ChecklistQuestion[];
  addChecklistQuestion: (question: Omit<ChecklistQuestion, 'id'>) => Promise<void>;
  updateChecklistQuestion: (id: string, question: Partial<ChecklistQuestion>) => Promise<void>;
  deleteChecklistQuestion: (id: string) => Promise<void>;
  scientificMethodTemplates: ScientificMethodTemplate[];
  addScientificMethodTemplate: (template: Omit<ScientificMethodTemplate, 'id'>) => Promise<void>;
  updateScientificMethodTemplate: (id: string, template: Partial<ScientificMethodTemplate>) => Promise<void>;
  deleteScientificMethodTemplate: (id: string) => Promise<void>;
  // New parameter entities
  companies: Company[];
  addCompany: (c: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (id: string, c: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  units: Unit[];
  addUnit: (u: Omit<Unit, 'id'>) => Promise<void>;
  updateUnit: (id: string, u: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  sectors: Sector[];
  addSector: (s: Omit<Sector, 'id'>) => Promise<void>;
  updateSector: (id: string, s: Partial<Sector>) => Promise<void>;
  deleteSector: (id: string) => Promise<void>;
  jobRoles: StandardJobRole[];
  addJobRole: (r: Omit<StandardJobRole, 'id'>) => Promise<void>;
  updateJobRole: (id: string, r: Partial<StandardJobRole>) => Promise<void>;
  deleteJobRole: (id: string) => Promise<void>;
  epis: EPI[];
  addEPI: (e: Omit<EPI, 'id'>) => Promise<void>;
  updateEPI: (id: string, e: Partial<EPI>) => Promise<void>;
  deleteEPI: (id: string) => Promise<void>;
  equipment: StandardEquipment[];
  addEquipment: (e: Omit<StandardEquipment, 'id'>) => Promise<void>;
  updateEquipment: (id: string, e: Partial<StandardEquipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  surveyQuestions: SurveyQuestion[];
  addSurveyQuestion: (q: Omit<SurveyQuestion, 'id'>) => Promise<void>;
  updateSurveyQuestion: (id: string, q: Partial<SurveyQuestion>) => Promise<void>;
  deleteSurveyQuestion: (id: string) => Promise<void>;
  pauses: StandardPause[];
  addPause: (p: Omit<StandardPause, 'id'>) => Promise<void>;
  updatePause: (id: string, p: Partial<StandardPause>) => Promise<void>;
  deletePause: (id: string) => Promise<void>;
  riskClassifications: RiskClassification[];
  addRiskClassification: (r: Omit<RiskClassification, 'id'>) => Promise<void>;
  updateRiskClassification: (id: string, r: Partial<RiskClassification>) => Promise<void>;
  deleteRiskClassification: (id: string) => Promise<void>;
  reportTexts: ReportTextTemplate[];
  addReportText: (t: Omit<ReportTextTemplate, 'id'>) => Promise<void>;
  updateReportText: (id: string, t: Partial<ReportTextTemplate>) => Promise<void>;
  deleteReportText: (id: string) => Promise<void>;
  shifts: Shift[];
  addShift: (s: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: string, s: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  // Illuminance normative parameters
  illuminanceNormativeParams: IlluminanceNormativeParameter[];
  addIlluminanceNormativeParam: (p: Omit<IlluminanceNormativeParameter, 'id'>) => Promise<void>;
  updateIlluminanceNormativeParam: (id: string, p: Partial<IlluminanceNormativeParameter>) => Promise<void>;
  deleteIlluminanceNormativeParam: (id: string) => Promise<void>;
  biomechanicalRiskFactors: BiomechanicalRiskFactor[];
  addBiomechanicalRiskFactor: (p: Omit<BiomechanicalRiskFactor, 'id'>) => Promise<void>;
  updateBiomechanicalRiskFactor: (id: string, p: Partial<BiomechanicalRiskFactor>) => Promise<void>;
  deleteBiomechanicalRiskFactor: (id: string) => Promise<void>;
}

const AETContext = createContext<AETContextType | undefined>(undefined);

function makeCRUD<T extends { id: string }>(
  key: string,
  state: T[],
  setState: React.Dispatch<React.SetStateAction<T[]>>
) {
  const save = async (next: T[]) => {
    await localforage.setItem(key, next);
    setState(next);
  };
  return {
    add: async (item: Omit<T, 'id'>) => { await save([...state, { ...item, id: uuidv4() } as T]); },
    update: async (id: string, item: Partial<T>) => { await save(state.map(x => x.id === id ? { ...x, ...item } : x)); },
    remove: async (id: string) => { await save(state.filter(x => x.id !== id)); },
  };
}

export const AETProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<AETProject[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [checklistQuestions, setChecklistQuestions] = useState<ChecklistQuestion[]>([]);
  const [scientificMethodTemplates, setScientificMethodTemplates] = useState<ScientificMethodTemplate[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobRoles, setJobRoles] = useState<StandardJobRole[]>([]);
  const [epis, setEPIs] = useState<EPI[]>([]);
  const [equipment, setEquipment] = useState<StandardEquipment[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [pauses, setPauses] = useState<StandardPause[]>([]);
  const [riskClassifications, setRiskClassifications] = useState<RiskClassification[]>([]);
  const [reportTexts, setReportTexts] = useState<ReportTextTemplate[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [illuminanceNormativeParams, setIlluminanceNormativeParams] = useState<IlluminanceNormativeParameter[]>([]);
  const [biomechanicalRiskFactors, setBiomechanicalRiskFactors] = useState<BiomechanicalRiskFactor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      let stored = await localforage.getItem<AETProject[]>('aet_projects');
      if (!stored || stored.length === 0) {
        stored = [createMockAEPProject(), createMockAETProject()];
        await localforage.setItem('aet_projects', stored);
      }
      // Normalize all projects (fills missing fields, guarantees arrays, AEP fields, etc.)
      {
        const { projects: normalized, changed } = normalizeProjectsOnLoad(stored);
        if (changed) await localforage.setItem('aet_projects', normalized);
        stored = normalized as any;
      }
      setProjects(stored);

      let storedClients = await localforage.getItem<Client[]>('aet_clients');
      if (!storedClients || storedClients.length === 0) {
        storedClients = MOCK_CLIENTS;
        await localforage.setItem('aet_clients', storedClients);
      }
      setClients(storedClients);

      let storedQuestions = await localforage.getItem<ChecklistQuestion[]>('aet_checklist_questions');
      if (!storedQuestions || storedQuestions.length === 0) {
        storedQuestions = MOCK_CHECKLIST_QUESTIONS;
        await localforage.setItem('aet_checklist_questions', storedQuestions);
      }
      setChecklistQuestions(storedQuestions);

      let storedMethodTemplates = await localforage.getItem<ScientificMethodTemplate[]>('aet_scientific_method_templates');
      if (!storedMethodTemplates || storedMethodTemplates.length === 0) {
        storedMethodTemplates = MOCK_SCIENTIFIC_METHODS;
        await localforage.setItem('aet_scientific_method_templates', storedMethodTemplates);
      }
      let migrated = false;
      storedMethodTemplates = storedMethodTemplates.map((t: any) => {
        if (typeof t.imageDataUrl === 'string' && !t.imageDataUrls) {
          migrated = true;
          const { imageDataUrl, ...rest } = t;
          return { ...rest, imageDataUrls: imageDataUrl ? [imageDataUrl] : [] };
        }
        if (!t.imageDataUrls) { migrated = true; return { ...t, imageDataUrls: [] }; }
        return t;
      });
      if (migrated) await localforage.setItem('aet_scientific_method_templates', storedMethodTemplates);
      setScientificMethodTemplates(storedMethodTemplates);

      const loadSimple = async <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T[]>>, mockData: T[] = []) => {
        const data = await localforage.getItem<T[]>(key);
        if (!data || data.length === 0) {
          if (mockData.length > 0) {
            await localforage.setItem(key, mockData);
            setter(mockData);
            return;
          }
        }
        setter(data ?? []);
      };
      {
        const raw = await localforage.getItem<Company[]>('aet_companies');
        if (!raw || raw.length === 0) {
          await localforage.setItem('aet_companies', MOCK_COMPANIES);
          setCompanies(MOCK_COMPANIES);
        } else {
          let migrated = false;
          const patched = raw.map((c: any) => {
            const needs = c.marketSituation === undefined || c.productionLocation === undefined;
            if (!needs) return c;
            migrated = true;
            return { ...c, marketSituation: c.marketSituation ?? '', productionLocation: c.productionLocation ?? '' };
          });
          if (migrated) await localforage.setItem('aet_companies', patched);
          setCompanies(patched);
        }
      }
      await loadSimple<Unit>('aet_units', setUnits, MOCK_UNITS);
      await loadSimple<Sector>('aet_sectors', setSectors, MOCK_SECTORS);
      await loadSimple<StandardJobRole>('aet_job_roles', setJobRoles, MOCK_JOB_ROLES);
      await loadSimple<EPI>('aet_epis', setEPIs, MOCK_EPIS);
      await loadSimple<StandardEquipment>('aet_equipment', setEquipment, MOCK_EQUIPMENT);
      await loadSimple<SurveyQuestion>('aet_survey_questions', setSurveyQuestions, MOCK_SURVEY_QUESTIONS);
      await loadSimple<StandardPause>('aet_pauses', setPauses, MOCK_PAUSES);
      await loadSimple<RiskClassification>('aet_risk_classifications', setRiskClassifications, MOCK_RISK_CLASSIFICATIONS);
      await loadSimple<ReportTextTemplate>('aet_report_texts', setReportTexts, MOCK_REPORT_TEXTS);
      
      const loadedShifts = await localforage.getItem<Shift[]>('aet_shifts');
      if (!loadedShifts || loadedShifts.length === 0) {
        await localforage.setItem('aet_shifts', MOCK_SHIFTS);
        setShifts(MOCK_SHIFTS);
      } else {
        // Migration: strip emojis from existing names
        const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const cleaned = loadedShifts.map(s => ({
          ...s,
          name: s.name.replace(emojiRegex, '').trim()
        }));
        if (JSON.stringify(cleaned) !== JSON.stringify(loadedShifts)) {
          await localforage.setItem('aet_shifts', cleaned);
          setShifts(cleaned);
        } else {
          setShifts(loadedShifts);
        }
      }

      await loadSimple<IlluminanceNormativeParameter>('aet_illuminance_norms', setIlluminanceNormativeParams, DEFAULT_NORMATIVE_PARAMETERS);
      {
        // Remove dados mockados antigos e usa apenas o que foi cadastrado em Parâmetros
        await localforage.removeItem('aet_biomechanical_risk_factors');
        const raw = await localforage.getItem<BiomechanicalRiskFactor[]>('aet_biomechanical_risk_factors_v2');
        if (!raw) {
          await localforage.setItem('aet_biomechanical_risk_factors_v2', []);
          setBiomechanicalRiskFactors([]);
        } else {
          setBiomechanicalRiskFactors(raw);
        }
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const saveToStorage = async (newProjects: AETProject[]) => {
    await localforage.setItem('aet_projects', newProjects);
    setProjects(newProjects);
  };

  const addProject = async (projectData: Omit<AETProject, 'id' | 'functions'>) => {
    const newProject = normalizeProject({ ...projectData, id: uuidv4(), functions: [] });
    await saveToStorage([...projects, newProject]);
    return newProject.id;
  };
  const updateProject = async (id: string, projectData: Partial<AETProject>) => {
    await saveToStorage(projects.map(p => p.id === id ? { ...p, ...projectData } : p));
  };
  const deleteProject = async (id: string) => { await saveToStorage(projects.filter(p => p.id !== id)); };
  const getProject = (id: string) => projects.find(p => p.id === id);

  const addFunction = async (projectId: string, funcData: Partial<AETFunction>) => {
    console.log('Context: addFunction starting...', { projectId });
    const newFunc = normalizeFunction({ ...funcData, id: uuidv4() });
    
    return new Promise<string>((resolve, reject) => {
      setProjects(prev => {
        try {
          const projectExists = prev.some(p => p.id === projectId);
          if (!projectExists) {
            console.error('Context: Project not found!', projectId);
            throw new Error('Projeto não encontrado');
          }
          
          const next = prev.map(p => p.id === projectId ? { ...p, functions: [...p.functions, newFunc] } : p);
          localforage.setItem('aet_projects', next).then(() => {
            console.log('Context: Function saved to storage');
            resolve(newFunc.id);
          }).catch(err => {
            console.error('Context: Error saving to storage', err);
            reject(err);
          });
          return next;
        } catch (err) {
          reject(err);
          return prev;
        }
      });
    });
  };
  const updateFunction = async (projectId: string, functionId: string, funcData: Partial<AETFunction>) => {
    setProjects(prev => {
      const next = prev.map(p =>
        p.id === projectId ? { ...p, functions: p.functions.map(f => f.id === functionId ? { ...f, ...funcData } : f) } : p
      );
      localforage.setItem('aet_projects', next);
      return next;
    });
  };
  const deleteFunction = async (projectId: string, functionId: string) => {
    setProjects(prev => {
      const next = prev.map(p =>
        p.id === projectId ? { ...p, functions: p.functions.filter(f => f.id !== functionId) } : p
      );
      localforage.setItem('aet_projects', next);
      return next;
    });
  };
  const duplicateFunction = async (projectId: string, functionId: string) => {
    let finalId = '';
    setProjects(prev => {
      const project = prev.find(p => p.id === projectId);
      const func = project?.functions.find(f => f.id === functionId);
      if (!func) return prev;
      
      const newFunc: AETFunction = { ...JSON.parse(JSON.stringify(func)), id: uuidv4(), name: `${func.name} (Cópia)` };
      newFunc.improvements = newFunc.improvements.map((imp: any) => ({ ...imp, id: uuidv4() }));
      newFunc.scientificMethods = newFunc.scientificMethods.map((m: any) => ({ ...m, id: uuidv4() }));
      newFunc.images = newFunc.images.map((img: any) => ({ ...img, id: uuidv4() }));
      newFunc.illumination.checklist = newFunc.illumination.checklist.map((c: any) => ({ ...c, id: uuidv4() }));
      
      finalId = newFunc.id;
      const next = prev.map(p => p.id === projectId ? { ...p, functions: [...p.functions, newFunc] } : p);
      localforage.setItem('aet_projects', next);
      return next;
    });
    return finalId;
  };

  const exportProjectJSON = (projectId: string): string | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    return JSON.stringify(project, null, 2);
  };
  const importProjectJSON = async (json: string): Promise<string | null> => {
    try {
      const raw = JSON.parse(json);
      const imported = normalizeProject({
        ...raw,
        id: uuidv4(),
        companyName: `${raw.companyName ?? ''} (Importado)`,
      });
      await saveToStorage([...projects, imported]);
      return imported.id;
    } catch { return null; }
  };

  const saveClientsToStorage = async (newClients: Client[]) => {
    await localforage.setItem('aet_clients', newClients);
    setClients(newClients);
  };
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = { ...clientData, id: uuidv4() };
    await saveClientsToStorage([...clients, newClient]);
    return newClient.id;
  };
  const updateClient = async (id: string, clientData: Partial<Client>) => {
    await saveClientsToStorage(clients.map(c => c.id === id ? { ...c, ...clientData } : c));
  };
  const deleteClient = async (id: string) => { await saveClientsToStorage(clients.filter(c => c.id !== id)); };

  const addChecklistQuestion = async (questionData: Omit<ChecklistQuestion, 'id'>) => {
    const newQ: ChecklistQuestion = { ...questionData, id: uuidv4() };
    const next = [...checklistQuestions, newQ];
    await localforage.setItem('aet_checklist_questions', next);
    setChecklistQuestions(next);
  };
  const updateChecklistQuestion = async (id: string, questionData: Partial<ChecklistQuestion>) => {
    const next = checklistQuestions.map(q => q.id === id ? { ...q, ...questionData } : q);
    await localforage.setItem('aet_checklist_questions', next);
    setChecklistQuestions(next);
  };
  const deleteChecklistQuestion = async (id: string) => {
    const next = checklistQuestions.filter(q => q.id !== id);
    await localforage.setItem('aet_checklist_questions', next);
    setChecklistQuestions(next);
  };

  const addScientificMethodTemplate = async (templateData: Omit<ScientificMethodTemplate, 'id'>) => {
    const newT: ScientificMethodTemplate = { ...templateData, id: uuidv4() };
    const updated = [...scientificMethodTemplates, newT];
    await localforage.setItem('aet_scientific_method_templates', updated);
    setScientificMethodTemplates(updated);
  };
  const updateScientificMethodTemplate = async (id: string, templateData: Partial<ScientificMethodTemplate>) => {
    const updated = scientificMethodTemplates.map((t: ScientificMethodTemplate) => t.id === id ? { ...t, ...templateData } : t);
    await localforage.setItem('aet_scientific_method_templates', updated);
    setScientificMethodTemplates(updated);
  };
  const deleteScientificMethodTemplate = async (id: string) => {
    const updated = scientificMethodTemplates.filter((t: ScientificMethodTemplate) => t.id !== id);
    await localforage.setItem('aet_scientific_method_templates', updated);
    setScientificMethodTemplates(updated);
  };

  // Generic CRUD helpers for new parameter entities
  const companyCRUD = makeCRUD('aet_companies', companies, setCompanies);
  const unitCRUD = makeCRUD('aet_units', units, setUnits);
  const sectorCRUD = makeCRUD('aet_sectors', sectors, setSectors);
  const jobRoleCRUD = makeCRUD('aet_job_roles', jobRoles, setJobRoles);
  const epiCRUD = makeCRUD('aet_epis', epis, setEPIs);
  const equipmentCRUD = makeCRUD('aet_equipment', equipment, setEquipment);
  const surveyQuestionCRUD = makeCRUD('aet_survey_questions', surveyQuestions, setSurveyQuestions);
  const pauseCRUD = makeCRUD('aet_pauses', pauses, setPauses);
  const riskClassificationCRUD = makeCRUD('aet_risk_classifications', riskClassifications, setRiskClassifications);
  const reportTextCRUD = makeCRUD('aet_report_texts', reportTexts, setReportTexts);
  const shiftCRUD = makeCRUD('aet_shifts', shifts, setShifts);
  const illuminanceNormCRUD = makeCRUD('aet_illuminance_norms', illuminanceNormativeParams, setIlluminanceNormativeParams);
  const biomechanicalRiskFactorCRUD = makeCRUD('aet_biomechanical_risk_factors_v2', biomechanicalRiskFactors, setBiomechanicalRiskFactors);

  const resetDevelopmentData = async () => {
    await localforage.clear();
    window.location.reload();
  };

  return (
    <AETContext.Provider value={{
      projects, loading, addProject, updateProject, deleteProject, getProject,
      addFunction, updateFunction, deleteFunction, duplicateFunction,
      exportProjectJSON, importProjectJSON, resetDevelopmentData,
      clients, addClient, updateClient, deleteClient,
      checklistQuestions, addChecklistQuestion, updateChecklistQuestion, deleteChecklistQuestion,
      scientificMethodTemplates, addScientificMethodTemplate, updateScientificMethodTemplate, deleteScientificMethodTemplate,
      companies, addCompany: companyCRUD.add, updateCompany: companyCRUD.update, deleteCompany: companyCRUD.remove,
      units, addUnit: unitCRUD.add, updateUnit: unitCRUD.update, deleteUnit: unitCRUD.remove,
      sectors, addSector: sectorCRUD.add, updateSector: sectorCRUD.update, deleteSector: sectorCRUD.remove,
      jobRoles, addJobRole: jobRoleCRUD.add, updateJobRole: jobRoleCRUD.update, deleteJobRole: jobRoleCRUD.remove,
      epis, addEPI: epiCRUD.add, updateEPI: epiCRUD.update, deleteEPI: epiCRUD.remove,
      equipment, addEquipment: equipmentCRUD.add, updateEquipment: equipmentCRUD.update, deleteEquipment: equipmentCRUD.remove,
      surveyQuestions, addSurveyQuestion: surveyQuestionCRUD.add, updateSurveyQuestion: surveyQuestionCRUD.update, deleteSurveyQuestion: surveyQuestionCRUD.remove,
      pauses, addPause: pauseCRUD.add, updatePause: pauseCRUD.update, deletePause: pauseCRUD.remove,
      riskClassifications, addRiskClassification: riskClassificationCRUD.add, updateRiskClassification: riskClassificationCRUD.update, deleteRiskClassification: riskClassificationCRUD.remove,
      reportTexts, addReportText: reportTextCRUD.add, updateReportText: reportTextCRUD.update, deleteReportText: reportTextCRUD.remove,
      shifts, addShift: shiftCRUD.add, updateShift: shiftCRUD.update, deleteShift: shiftCRUD.remove,
      illuminanceNormativeParams,
      addIlluminanceNormativeParam: illuminanceNormCRUD.add,
      updateIlluminanceNormativeParam: illuminanceNormCRUD.update,
      deleteIlluminanceNormativeParam: illuminanceNormCRUD.remove,
      biomechanicalRiskFactors,
      addBiomechanicalRiskFactor: biomechanicalRiskFactorCRUD.add,
      updateBiomechanicalRiskFactor: biomechanicalRiskFactorCRUD.update,
      deleteBiomechanicalRiskFactor: biomechanicalRiskFactorCRUD.remove,
    }}>
      {children}
    </AETContext.Provider>
  );
};

export const useAET = () => {
  const context = useContext(AETContext);
  if (context === undefined) throw new Error('useAET must be used within an AETProvider');
  return context;
};
