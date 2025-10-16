import React, { useEffect, useState } from 'react';
import EmployeeList from '../components/EmployeeList';
import { fetchEmployees, deleteEmployee } from '../services/employeeApi';
import { Employee } from '../types/Employee';

const EmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setEmployees(await fetchEmployees());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (window.confirm('Delete this employee?')) {
      await deleteEmployee(id);
      await load();
    }
  }

  return <EmployeeList employees={employees} onDelete={handleDelete} loading={loading} />;
};

export default EmployeeListPage;
