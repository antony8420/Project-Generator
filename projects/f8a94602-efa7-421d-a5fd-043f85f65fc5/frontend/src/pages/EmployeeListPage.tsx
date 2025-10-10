import React, { useEffect, useState } from 'react';
import { Employee } from '../types/Employee';
import { fetchEmployees, deleteEmployee, exportEmployeesCSV } from '../services/employeeApi';
import { EmployeeTable } from '../components/EmployeeTable';
import { Pagination } from '../components/Pagination';
import { downloadCSV } from '../utils/downloadCSV';

interface Props {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export const EmployeeListPage: React.FC<Props> = ({ onView, onEdit, onCreate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const pageSize = 10;

  async function load() {
    const { employees, total } = await fetchEmployees({ page, pageSize, search, department });
    setEmployees(employees);
    setTotal(total);
  }

  useEffect(() => { load(); }, [page, search, department]);

  async function handleDelete(id: string) {
    if (window.confirm('Delete employee?')) {
      await deleteEmployee(id);
      load();
    }
  }

  async function handleExport() {
    const blob = await exportEmployeesCSV();
    downloadCSV(blob, 'employees.csv');
  }

  return (
    <div>
      <h2>Employee List</h2>
      <div>
        <input placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)} />
        <input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
        <button onClick={onCreate}>Register Employee</button>
        <button onClick={handleExport}>Export CSV</button>
      </div>
      <EmployeeTable employees={employees} onView={onView} onEdit={onEdit} onDelete={handleDelete} />
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
};
