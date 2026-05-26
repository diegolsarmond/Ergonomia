import React from 'react';
import { useParams } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { AETPreview } from './reports/AETPreview';
import { AEPPreview } from './reports/AEPPreview';

export const PDFPreview = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, fetchProjectDetails } = useAET();
  const [loadingProject, setLoadingProject] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      setLoadingProject(true);
      fetchProjectDetails(id)
        .catch(err => console.error(err))
        .finally(() => setLoadingProject(false));
    }
  }, [id, fetchProjectDetails]);

  const project = getProject(id!);

  if (loadingProject || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Carregando detalhes do projeto...</p>
      </div>
    );
  }

  if (project.reportType === 'AEP') {
    return <AEPPreview project={project} />;
  }

  return <AETPreview project={project} />;
};
