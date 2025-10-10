// Main app component
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FileImport from './file-intake/pages/FileImport';
import ParserResults from './x12-parser/pages/ParserResults';
import ClaimQueue from './claim-management/pages/ClaimQueue';
import BusinessValidationResults from './business-validation/pages/BusinessValidationResults';
import MasterDataSetup from './master-data/pages/MasterDataSetup';
import WorkflowDashboard from './workflow/pages/WorkflowDashboard';
import SubmissionQueue from './submission/pages/SubmissionQueue';
import ReportingDashboard from './reporting/pages/ReportingDashboard';
import DenialsDashboard from './denials-ml/pages/DenialsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/file-import" element={<FileImport />} />
        <Route path="/parser-results" element={<ParserResults />} />
        <Route path="/claim-queue" element={<ClaimQueue />} />
        <Route path="/business-validation" element={<BusinessValidationResults />} />
        <Route path="/master-data" element={<MasterDataSetup />} />
        <Route path="/workflow" element={<WorkflowDashboard />} />
        <Route path="/submission" element={<SubmissionQueue />} />
        <Route path="/reporting" element={<ReportingDashboard />} />
        <Route path="/denials" element={<DenialsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;