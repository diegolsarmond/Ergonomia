import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  AETProject, AETFunction, ChecklistQuestion, ScientificMethodTemplate,
  Company, Unit, Sector, StandardJobRole, EPI, StandardEquipment,
  SurveyQuestion, StandardPause, RiskClassification, ReportTextTemplate, Shift,
  BiomechanicalRiskFactor,
} from '../types';
import type { IlluminanceNormativeParameter } from '../domain/illuminance/illuminanceTypes';
import { normalizeFunction, normalizeProject, normalizeProjectsOnLoad } from '../domain/normalize';
import { Client } from '../data/mockClients';
import {
  companiesApi, unitsApi, sectorsApi, jobRolesApi, episApi, equipmentApi,
  surveyQuestionsApi, pausesApi, shiftsApi, riskClassificationsApi, reportTextsApi,
  scientificMethodsApi, checklistQuestionsApi, biomechanicalFactorsApi,
  illuminanceParamsApi, projectsApi, clientsApi,
} from '../services/api';

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
      try {
        const [
          rawProjects, rawClients, rawChecklist, rawMethods,
          rawCompanies, rawUnits, rawSectors, rawJobRoles,
          rawEpis, rawEquipment, rawSurvey, rawPauses,
          rawShifts, rawRisks, rawTexts, rawBiomech,
          rawIllum,
        ] = await Promise.all([
          projectsApi.list(),
          clientsApi.list(),
          checklistQuestionsApi.list(),
          scientificMethodsApi.list(),
          companiesApi.list(),
          unitsApi.list(),
          sectorsApi.list(),
          jobRolesApi.list(),
          episApi.list(),
          equipmentApi.list(),
          surveyQuestionsApi.list(),
          pausesApi.list(),
          shiftsApi.list(),
          riskClassificationsApi.list(),
          reportTextsApi.list(),
          biomechanicalFactorsApi.list(),
          illuminanceParamsApi.list(),
        ]);

        // Normaliza projetos (garante campos obrigatórios e arrays)
        const { projects: normalized } = normalizeProjectsOnLoad(rawProjects as AETProject[]);
        setProjects(normalized as AETProject[]);

        setClients(rawClients as Client[]);
        setChecklistQuestions(rawChecklist as ChecklistQuestion[]);
        setScientificMethodTemplates(rawMethods as ScientificMethodTemplate[]);
        setCompanies(rawCompanies as Company[]);
        setUnits(rawUnits as Unit[]);
        setSectors(rawSectors as Sector[]);
        setJobRoles(rawJobRoles as StandardJobRole[]);
        setEPIs(rawEpis as EPI[]);
        setEquipment(rawEquipment as StandardEquipment[]);
        setSurveyQuestions(rawSurvey as SurveyQuestion[]);
        setPauses(rawPauses as StandardPause[]);
        setShifts(rawShifts as Shift[]);
        setRiskClassifications(rawRisks as RiskClassification[]);
        setReportTexts(rawTexts as ReportTextTemplate[]);
        setBiomechanicalRiskFactors(rawBiomech as BiomechanicalRiskFactor[]);
        setIlluminanceNormativeParams(rawIllum as IlluminanceNormativeParameter[]);
      } catch (err) {
        console.error('Erro ao carregar dados do servidor:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Projetos ───────────────────────────────────────────────────────────────

  const saveProject = async (project: AETProject) => {
    await projectsApi.update(project.id, project);
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  const addProject = async (projectData: Omit<AETProject, 'id' | 'functions'>) => {
    const newProject = normalizeProject({ ...projectData, id: uuidv4(), functions: [] });
    await projectsApi.save(newProject);
    setProjects(prev => [...prev, newProject]);
    return newProject.id;
  };

  const updateProject = async (id: string, projectData: Partial<AETProject>) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...projectData } : p);
      const updated = next.find(p => p.id === id)!;
      projectsApi.update(id, updated).catch(console.error);
      return next;
    });
  };

  const deleteProject = async (id: string) => {
    await projectsApi.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  const addFunction = async (projectId: string, funcData: Partial<AETFunction>) => {
    const newFunc = normalizeFunction({ ...funcData, id: uuidv4() });
    return new Promise<string>((resolve, reject) => {
      setProjects(prev => {
        try {
          const next = prev.map(p =>
            p.id === projectId ? { ...p, functions: [...p.functions, newFunc] } : p
          );
          const updated = next.find(p => p.id === projectId)!;
          projectsApi.update(projectId, updated).then(() => resolve(newFunc.id)).catch(reject);
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
        p.id === projectId
          ? {
              ...p,
              functions: p.functions.map(f =>
                f.id === functionId ? normalizeFunction({ ...f, ...funcData }) : f
              ),
            }
          : p
      );
      const updated = next.find(p => p.id === projectId)!;
      projectsApi.update(projectId, updated).catch(console.error);
      return next;
    });
  };

  const deleteFunction = async (projectId: string, functionId: string) => {
    setProjects(prev => {
      const next = prev.map(p =>
        p.id === projectId ? { ...p, functions: p.functions.filter(f => f.id !== functionId) } : p
      );
      const updated = next.find(p => p.id === projectId)!;
      projectsApi.update(projectId, updated).catch(console.error);
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
      const updated = next.find(p => p.id === projectId)!;
      projectsApi.update(projectId, updated).catch(console.error);
      return next;
    });
    return finalId;
  };

  const exportProjectJSON = (projectId: string): string | null => {
    const project = projects.find(p => p.id === projectId);
    return project ? JSON.stringify(project, null, 2) : null;
  };

  const importProjectJSON = async (json: string): Promise<string | null> => {
    try {
      const raw = JSON.parse(json);
      const imported = normalizeProject({ ...raw, id: uuidv4(), companyName: `${raw.companyName ?? ''} (Importado)` });
      await projectsApi.save(imported);
      setProjects(prev => [...prev, imported]);
      return imported.id;
    } catch { return null; }
  };

  const resetDevelopmentData = async () => {
    // Remove todos os projetos e clientes do banco
    await Promise.all(projects.map(p => projectsApi.delete(p.id)));
    await Promise.all(clients.map(c => clientsApi.delete(c.id)));
    setProjects([]);
    setClients([]);
  };

  // ── Clientes ───────────────────────────────────────────────────────────────

  const addClient = async (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = { ...clientData, id: uuidv4() };
    await clientsApi.save(newClient);
    setClients(prev => [...prev, newClient]);
    return newClient.id;
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    setClients(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...clientData } : c);
      const updated = next.find(c => c.id === id)!;
      clientsApi.update(id, updated).catch(console.error);
      return next;
    });
  };

  const deleteClient = async (id: string) => {
    await clientsApi.delete(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // ── Checklist ──────────────────────────────────────────────────────────────

  const addChecklistQuestion = async (data: Omit<ChecklistQuestion, 'id'>) => {
    const created = await checklistQuestionsApi.create(data);
    setChecklistQuestions(prev => [...prev, created as ChecklistQuestion]);
  };
  const updateChecklistQuestion = async (id: string, data: Partial<ChecklistQuestion>) => {
    const prev = checklistQuestions.find(q => q.id === id)!;
    const updated = await checklistQuestionsApi.update(id, { ...prev, ...data });
    setChecklistQuestions(qs => qs.map(q => q.id === id ? updated as ChecklistQuestion : q));
  };
  const deleteChecklistQuestion = async (id: string) => {
    await checklistQuestionsApi.delete(id);
    setChecklistQuestions(qs => qs.filter(q => q.id !== id));
  };

  // ── Métodos científicos ────────────────────────────────────────────────────

  const addScientificMethodTemplate = async (data: Omit<ScientificMethodTemplate, 'id'>) => {
    const created = await scientificMethodsApi.create(data);
    setScientificMethodTemplates(prev => [...prev, created as ScientificMethodTemplate]);
  };
  const updateScientificMethodTemplate = async (id: string, data: Partial<ScientificMethodTemplate>) => {
    const prev = scientificMethodTemplates.find(t => t.id === id)!;
    const updated = await scientificMethodsApi.update(id, { ...prev, ...data });
    setScientificMethodTemplates(ts => ts.map(t => t.id === id ? updated as ScientificMethodTemplate : t));
  };
  const deleteScientificMethodTemplate = async (id: string) => {
    await scientificMethodsApi.delete(id);
    setScientificMethodTemplates(ts => ts.filter(t => t.id !== id));
  };

  // ── Helpers genéricos para entidades de catálogo ──────────────────────────

  function makeCatalogCRUD<T extends { id: string }>(
    api: { list: () => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: string, d: any) => Promise<any>; delete: (id: string) => Promise<void> },
    state: T[],
    setState: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    return {
      add: async (data: Omit<T, 'id'>) => {
        const created = await api.create(data);
        setState(prev => [...prev, created as T]);
      },
      update: async (id: string, data: Partial<T>) => {
        const prev = state.find(x => x.id === id)!;
        const updated = await api.update(id, { ...prev, ...data });
        setState(xs => xs.map(x => x.id === id ? updated as T : x));
      },
      remove: async (id: string) => {
        await api.delete(id);
        setState(xs => xs.filter(x => x.id !== id));
      },
    };
  }

  const companyCRUD          = makeCatalogCRUD(companiesApi,          companies,          setCompanies);
  const unitCRUD             = makeCatalogCRUD(unitsApi,              units,              setUnits);
  const sectorCRUD           = makeCatalogCRUD(sectorsApi,            sectors,            setSectors);
  const jobRoleCRUD          = makeCatalogCRUD(jobRolesApi,           jobRoles,           setJobRoles);
  const epiCRUD              = makeCatalogCRUD(episApi,               epis,               setEPIs);
  const equipmentCRUD        = makeCatalogCRUD(equipmentApi,          equipment,          setEquipment);
  const surveyQuestionCRUD   = makeCatalogCRUD(surveyQuestionsApi,    surveyQuestions,    setSurveyQuestions);
  const pauseCRUD            = makeCatalogCRUD(pausesApi,             pauses,             setPauses);
  const riskClassCRUD        = makeCatalogCRUD(riskClassificationsApi,riskClassifications,setRiskClassifications);
  const reportTextCRUD       = makeCatalogCRUD(reportTextsApi,        reportTexts,        setReportTexts);
  const shiftCRUD            = makeCatalogCRUD(shiftsApi,             shifts,             setShifts);
  const illuminanceCRUD      = makeCatalogCRUD(illuminanceParamsApi,  illuminanceNormativeParams, setIlluminanceNormativeParams);
  const biomechCRUD          = makeCatalogCRUD(biomechanicalFactorsApi, biomechanicalRiskFactors, setBiomechanicalRiskFactors);

  return (
    <AETContext.Provider value={{
      projects, loading, addProject, updateProject, deleteProject, getProject,
      addFunction, updateFunction, deleteFunction, duplicateFunction,
      exportProjectJSON, importProjectJSON, resetDevelopmentData,
      clients, addClient, updateClient, deleteClient,
      checklistQuestions, addChecklistQuestion, updateChecklistQuestion, deleteChecklistQuestion,
      scientificMethodTemplates, addScientificMethodTemplate, updateScientificMethodTemplate, deleteScientificMethodTemplate,
      companies,    addCompany: companyCRUD.add,        updateCompany: companyCRUD.update,        deleteCompany: companyCRUD.remove,
      units,        addUnit: unitCRUD.add,              updateUnit: unitCRUD.update,              deleteUnit: unitCRUD.remove,
      sectors,      addSector: sectorCRUD.add,          updateSector: sectorCRUD.update,          deleteSector: sectorCRUD.remove,
      jobRoles,     addJobRole: jobRoleCRUD.add,         updateJobRole: jobRoleCRUD.update,         deleteJobRole: jobRoleCRUD.remove,
      epis,         addEPI: epiCRUD.add,               updateEPI: epiCRUD.update,               deleteEPI: epiCRUD.remove,
      equipment,    addEquipment: equipmentCRUD.add,    updateEquipment: equipmentCRUD.update,    deleteEquipment: equipmentCRUD.remove,
      surveyQuestions, addSurveyQuestion: surveyQuestionCRUD.add, updateSurveyQuestion: surveyQuestionCRUD.update, deleteSurveyQuestion: surveyQuestionCRUD.remove,
      pauses,       addPause: pauseCRUD.add,            updatePause: pauseCRUD.update,            deletePause: pauseCRUD.remove,
      riskClassifications, addRiskClassification: riskClassCRUD.add, updateRiskClassification: riskClassCRUD.update, deleteRiskClassification: riskClassCRUD.remove,
      reportTexts,  addReportText: reportTextCRUD.add,  updateReportText: reportTextCRUD.update,  deleteReportText: reportTextCRUD.remove,
      shifts,       addShift: shiftCRUD.add,            updateShift: shiftCRUD.update,            deleteShift: shiftCRUD.remove,
      illuminanceNormativeParams,
      addIlluminanceNormativeParam: illuminanceCRUD.add,
      updateIlluminanceNormativeParam: illuminanceCRUD.update,
      deleteIlluminanceNormativeParam: illuminanceCRUD.remove,
      biomechanicalRiskFactors,
      addBiomechanicalRiskFactor: biomechCRUD.add,
      updateBiomechanicalRiskFactor: biomechCRUD.update,
      deleteBiomechanicalRiskFactor: biomechCRUD.remove,
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
