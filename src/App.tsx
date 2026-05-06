/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AETProvider } from './context/AETContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './screens/Login';
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
import { Users } from './screens/Users';

export default function App() {
  return (
    <AuthProvider>
      <AETProvider>
        <BrowserRouter>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<Login />} />

            {/* Protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/aep" replace />} />
              <Route path="aep" element={<Dashboard reportType="AEP" />} />
              <Route path="aet" element={<Dashboard reportType="AET" />} />
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
              <Route path="users" element={<Users />} />
            </Route>

            <Route
              path="/project/:id/preview"
              element={
                <ProtectedRoute>
                  <PDFPreview />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AETProvider>
    </AuthProvider>
  );
}
