import React from 'react';
import { useParams } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { AETPreview } from './reports/AETPreview';
import { AEPPreview } from './reports/AEPPreview';

export const PDFPreview = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, loading } = useAET();
  const project = getProject(id!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Carregando...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Projeto não encontrado.</p>
      </div>
    );
  }

  if (project.reportType === 'AEP') {
    return <AEPPreview project={project} />;
  }

  return <AETPreview project={project} />;
};
