import React, { useState } from 'react';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';

export const App: React.FC = () => {
  const [page, setPage] = useState<'list' | 'profile' | 'form'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [editId, setEditId] = useState<string | undefined>();

  function handleView(id: string) {
    setSelectedId(id);
    setPage('profile');
  }
  function handleEdit(id: string) {
    setEditId(id);
    setPage('form');
  }
  function handleCreate() {
    setEditId(undefined);
    setPage('form');
  }
  function handleBack() {
    setPage('list');
    setSelectedId(undefined);
    setEditId(undefined);
  }

  if (page === 'profile' && selectedId) {
    return <EmployeeProfilePage id={selectedId} onBack={handleBack} />;
  }
  if (page === 'form') {
    return <EmployeeFormPage id={editId} onBack={handleBack} />;
  }
  return <EmployeeListPage onView={handleView} onEdit={handleEdit} onCreate={handleCreate} />;
};
