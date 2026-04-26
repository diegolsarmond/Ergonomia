import React, { createContext, useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { AETProject, AETFunction, EMPTY_FUNCTION } from '../types';
import { createMockProject } from '../utils/mockData';

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
}

const AETContext = createContext<AETContextType | undefined>(undefined);

export const AETProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<AETProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      let stored = await localforage.getItem<AETProject[]>('aet_projects');
      if (!stored || stored.length === 0) {
        stored = [createMockProject()];
        await localforage.setItem('aet_projects', stored);
      }
      setProjects(stored);
      setLoading(false);
    };
    loadData();
  }, []);

  const saveToStorage = async (newProjects: AETProject[]) => {
    await localforage.setItem('aet_projects', newProjects);
    setProjects(newProjects);
  };

  const addProject = async (projectData: Omit<AETProject, 'id' | 'functions'>) => {
    const newProject: AETProject = { ...projectData, id: uuidv4(), functions: [] } as AETProject;
    await saveToStorage([...projects, newProject]);
    return newProject.id;
  };

  const updateProject = async (id: string, projectData: Partial<AETProject>) => {
    await saveToStorage(projects.map(p => p.id === id ? { ...p, ...projectData } : p));
  };

  const deleteProject = async (id: string) => {
    await saveToStorage(projects.filter(p => p.id !== id));
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  const addFunction = async (projectId: string, funcData: Partial<AETFunction>) => {
    const newFunc: AETFunction = { ...EMPTY_FUNCTION, id: uuidv4(), ...funcData };
    const newProjects = projects.map(p =>
      p.id === projectId ? { ...p, functions: [...p.functions, newFunc] } : p
    );
    await saveToStorage(newProjects);
    return newFunc.id;
  };

  const updateFunction = async (projectId: string, functionId: string, funcData: Partial<AETFunction>) => {
    const newProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, functions: p.functions.map(f => f.id === functionId ? { ...f, ...funcData } : f) }
        : p
    );
    await saveToStorage(newProjects);
  };

  const deleteFunction = async (projectId: string, functionId: string) => {
    const newProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, functions: p.functions.filter(f => f.id !== functionId) }
        : p
    );
    await saveToStorage(newProjects);
  };

  const duplicateFunction = async (projectId: string, functionId: string) => {
    const project = projects.find(p => p.id === projectId);
    const func = project?.functions.find(f => f.id === functionId);
    if (!func) return '';
    const newFunc: AETFunction = {
      ...JSON.parse(JSON.stringify(func)),
      id: uuidv4(),
      name: `${func.name} (Cópia)`,
    };
    // Regenerate IDs for nested items
    newFunc.improvements = newFunc.improvements.map((imp: any) => ({ ...imp, id: uuidv4() }));
    newFunc.scientificMethods = newFunc.scientificMethods.map((m: any) => ({ ...m, id: uuidv4() }));
    newFunc.images = newFunc.images.map((img: any) => ({ ...img, id: uuidv4() }));
    newFunc.illumination.checklist = newFunc.illumination.checklist.map((c: any) => ({ ...c, id: uuidv4() }));

    const newProjects = projects.map(p =>
      p.id === projectId ? { ...p, functions: [...p.functions, newFunc] } : p
    );
    await saveToStorage(newProjects);
    return newFunc.id;
  };

  const exportProjectJSON = (projectId: string): string | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    return JSON.stringify(project, null, 2);
  };

  const importProjectJSON = async (json: string): Promise<string | null> => {
    try {
      const parsed = JSON.parse(json) as AETProject;
      parsed.id = uuidv4();
      parsed.companyName = `${parsed.companyName} (Importado)`;
      await saveToStorage([...projects, parsed]);
      return parsed.id;
    } catch {
      return null;
    }
  };

  return (
    <AETContext.Provider value={{
      projects, loading, addProject, updateProject, deleteProject, getProject,
      addFunction, updateFunction, deleteFunction, duplicateFunction,
      exportProjectJSON, importProjectJSON
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
