import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmployeeListPage from './employees/pages/EmployeeListPage';
import EmployeeFormPage from './employees/pages/EmployeeFormPage';
import EmployeeProfilePage from './employees/pages/EmployeeProfilePage';
import Layout from './components/Layout';
import Navigation from './components/Navigation';

const App: React.FC = () => (
  <Layout>
    <Navigation />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/employees" element={<EmployeeListPage />} />
      <Route path="/employees/new" element={<EmployeeFormPage />} />
      <Route path="/employees/:id" element={<EmployeeProfilePage />} />
      {/* Add routes for other features here */}
    </Routes>
  </Layout>
);

export default App;
