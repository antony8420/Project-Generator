// Main React component
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FileImport from './file-intake/pages/FileImport';
import ValidationResults from './x12-parser/pages/ValidationResults';
import ClaimQueue from './claim-management/pages/ClaimQueue';
import BusinessValidationResults from './business-validation/pages/BusinessValidationResults';
import MasterDataSetup from './master-data/pages/MasterDataSetup';
import WorkflowDashboard from './workflow/pages/WorkflowDashboard';
import SubmissionQueue from './submission/pages/SubmissionQueue';
import Reporting from './reporting/pages/Reporting';
import DenialsAnalytics from './denials-ml/pages/DenialsAnalytics';
const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/file-import" element={<FileImport />} />
      <Route path="/validation-results" element={<ValidationResults />} />
      <Route path="/claim-queue" element={<ClaimQueue />} />
      <Route path="/business-validation-results" element={<BusinessValidationResults />} />
      <Route path="/master-data" element={<MasterDataSetup />} />
      <Route path="/workflow" element={<WorkflowDashboard />} />
      <Route path="/submission" element={<SubmissionQueue />} />
      <Route path="/reporting" element={<Reporting />} />
      <Route path="/denials-analytics" element={<DenialsAnalytics />} />
    </Routes>
  </BrowserRouter>
);
export default App;