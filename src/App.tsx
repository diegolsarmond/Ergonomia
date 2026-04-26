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
          </Route>
          <Route path="/project/:id/preview" element={<PDFPreview />} />
        </Routes>
      </BrowserRouter>
    </AETProvider>
  );
}
