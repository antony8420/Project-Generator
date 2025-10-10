// Main React component with feature-based routing
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FileImport from './file-intake/pages/FileImport';
import X12ValidationResults from './x12-parser/pages/X12ValidationResults';
import ClaimParsingResults from './claim-parsing/pages/ClaimParsingResults';
import BusinessValidationResults from './business-validation/pages/BusinessValidationResults';
import MasterDataManagement from './master-data/pages/MasterDataManagement';
import ClaimQueue from './workflow/pages/ClaimQueue';
import SubmissionResults from './submission/pages/SubmissionResults';
import Reporting from './reporting/pages/Reporting';
import DenialsAnalytics from './denials-ml/pages/DenialsAnalytics';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/import" element={<FileImport />} />
      <Route path="/x12-validation" element={<X12ValidationResults />} />
      <Route path="/claim-parsing" element={<ClaimParsingResults />} />
      <Route path="/business-validation" element={<BusinessValidationResults />} />
      <Route path="/master-data" element={<MasterDataManagement />} />
      <Route path="/claim-queue" element={<ClaimQueue />} />
      <Route path="/submission" element={<SubmissionResults />} />
      <Route path="/reporting" element={<Reporting />} />
      <Route path="/denials-analytics" element={<DenialsAnalytics />} />
    </Routes>
  </BrowserRouter>
);
export default App;