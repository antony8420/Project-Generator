import React, { useState } from 'react';
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import { Employee } from './types/employee';

export default function App() {
  const [page, setPage] = useState<'list' | 'create' | 'profile'>('list');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  function handleViewProfile(id: string) {
    setSelectedEmployeeId(id);
    setPage('profile');
  }

  function handleCreate() {
    setPage('create');
  }

  function handleBack() {
    setPage('list');
    setSelectedEmployeeId(null);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Employee Registration System</h1>
      {page === 'list' && <EmployeeListPage onCreate={handleCreate} onViewProfile={handleViewProfile} />}
      {page === 'create' && <EmployeeFormPage onBack={handleBack} />}
      {page === 'profile' && selectedEmployeeId && <EmployeeProfilePage employeeId={selectedEmployeeId} onBack={handleBack} />}
    </div>
  );
}
