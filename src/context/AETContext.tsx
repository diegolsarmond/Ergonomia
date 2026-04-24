import React, { createContext, useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { AETProject, AETFunction } from '../types';

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
}

const AETContext = createContext<AETContextType | undefined>(undefined);

export const AETProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<AETProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const stored = await localforage.getItem<AETProject[]>('aet_projects');
      if (stored) {
        setProjects(stored);
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
    const newProject: AETProject = {
      ...projectData,
      id: uuidv4(),
      functions: []
    };
    const newProjects = [...projects, newProject];
    await saveToStorage(newProjects);
    return newProject.id;
  };

  const updateProject = async (id: string, projectData: Partial<AETProject>) => {
    const newProjects = projects.map(p => p.id === id ? { ...p, ...projectData } : p);
    await saveToStorage(newProjects);
  };

  const deleteProject = async (id: string) => {
    const newProjects = projects.filter(p => p.id !== id);
    await saveToStorage(newProjects);
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  const addFunction = async (projectId: string, funcData: Partial<AETFunction>) => {
    const newFunc: AETFunction = {
      id: uuidv4(),
      name: '',
      numEmployees: '',
      demandOrigin: '',
      objective: '',
      demandFound: '',
      shifts: '',
      overtime: '',
      pauses: '',
      taskRotation: '',
      workspaceDescription: '',
      collabFormation: '',
      collabTurn: '',
      opinionGender: '',
      opinionAge: '',
      opinionTime: '',
      opinionObjective: '',
      opinionThermal: '',
      opinionLightingSens: '',
      opinionLightingDesc: '',
      opinionAcoustics: '',
      opinionEPI: '',
      opinionEquip: '',
      opinionCycle: '',
      opinionLayout: '',
      opinionDifficulties: '',
      opinionPressure: '',
      opinionRelationship: '',
      opinionLeadership: '',
      opinionMaintenanceInfluence: '',
      opinionMaintenanceDelay: '',
      effortDynamic: '',
      effortStatic: '',
      timeAnalysis: '',
      loadCarrying: '',
      displacement: '',
      maintenanceDesc: '',
      logisticsInfluence: '',
      logisticsDelay: '',
      reworkDesc: '',
      reworkWeek: '',
      equipments: '',
      equipPrinciple: '',
      equipProblems: '',
      cyclePrescribed: '',
      cycleReal: '',
      postureSittingPct: 50,
      postureStandingPct: 50,
      illuminationLux: '',
      illuminationComplies: true,
      rulaScore: '',
      rulaInterpretation: '',
      diagnosis: '',
      riskLevel: '',
      improvements: [],
      ...funcData,
    };
    
    const newProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, functions: [...p.functions, newFunc] };
      }
      return p;
    });
    
    await saveToStorage(newProjects);
    return newFunc.id;
  };

  const updateFunction = async (projectId: string, functionId: string, funcData: Partial<AETFunction>) => {
    const newProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          functions: p.functions.map(f => f.id === functionId ? { ...f, ...funcData } : f)
        };
      }
      return p;
    });
    await saveToStorage(newProjects);
  };

  const deleteFunction = async (projectId: string, functionId: string) => {
    const newProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          functions: p.functions.filter(f => f.id !== functionId)
        };
      }
      return p;
    });
    await saveToStorage(newProjects);
  };

  return (
    <AETContext.Provider value={{
      projects, loading, addProject, updateProject, deleteProject, getProject,
      addFunction, updateFunction, deleteFunction
    }}>
      {children}
    </AETContext.Provider>
  );
};

export const useAET = () => {
  const context = useContext(AETContext);
  if (context === undefined) {
    throw new Error('useAET must be used within an AETProvider');
  }
  return context;
};
