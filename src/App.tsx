/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AETProvider } from './context/AETContext';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { ProjectView } from './screens/ProjectView';
import { FunctionForm } from './screens/FunctionForm';
import { PDFPreview } from './screens/PDFPreview';
import { Clients } from './screens/Clients';
import { ChecklistParameters } from './screens/ChecklistParameters';
import { ScientificMethodsParameters } from './screens/ScientificMethodsParameters';
import { Companies } from './screens/parameters/Companies';
import { CompanyDetail } from './screens/parameters/CompanyDetail';
import { EPIs } from './screens/parameters/EPIs';
import { Equipment } from './screens/parameters/Equipment';
import { SurveyQuestions } from './screens/parameters/SurveyQuestions';
import { Pauses } from './screens/parameters/Pauses';
import { RiskClassifications } from './screens/parameters/RiskClassifications';
import { ReportTexts } from './screens/parameters/ReportTexts';
import { Shifts } from './screens/parameters/Shifts';

export default function App() {
  return (
    <AETProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="project/:id" element={<ProjectView />} />
            <Route path="project/:id/function/:funcId" element={<FunctionForm />} />
            <Route path="clients" element={<Clients />} />
            {/* Parameter routes */}
            <Route path="parameters/companies" element={<Companies />} />
            <Route path="parameters/companies/:id" element={<CompanyDetail />} />
            <Route path="parameters/epis" element={<EPIs />} />
            <Route path="parameters/equipment" element={<Equipment />} />
            <Route path="parameters/survey-questions" element={<SurveyQuestions />} />
            <Route path="parameters/pauses" element={<Pauses />} />
            <Route path="parameters/checklist" element={<ChecklistParameters />} />
            <Route path="parameters/scientific-methods" element={<ScientificMethodsParameters />} />
            <Route path="parameters/risk-classifications" element={<RiskClassifications />} />
            <Route path="parameters/report-texts" element={<ReportTexts />} />
            <Route path="parameters/shifts" element={<Shifts />} />
          </Route>
          <Route path="/project/:id/preview" element={<PDFPreview />} />
        </Routes>
      </BrowserRouter>
    </AETProvider>
  );
}
