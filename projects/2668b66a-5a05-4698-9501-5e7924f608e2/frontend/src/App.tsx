// Main app component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './authentication/pages/Login';
import Users from './user-management/pages/Users';
import Employees from './employee-management/pages/Employees';
import EmployeeDetail from './employee-management/pages/EmployeeDetail';
import AuditTrail from './audit-trail/pages/AuditTrail';

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/users" element={<Users />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/employees/:id" element={<EmployeeDetail />} />
      <Route path="/audit" element={<AuditTrail />} />
    </Routes>
  </Router>
);

export default App;
