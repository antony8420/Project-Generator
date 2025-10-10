import React, { useEffect, useState } from 'react';
import { Employee } from '../types/employee';
import { fetchEmployees, exportEmployeesCSV } from '../services/employeeApi';

interface Props {
  onCreate: () => void;
  onViewProfile: (id: string) => void;
}

export default function EmployeeListPage({ onCreate, onViewProfile }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    fetchEmployees({ page, pageSize, search, department, employeeId }).then(res => {
      setEmployees(res.employees);
      setTotal(res.total);
    });
  }, [page, pageSize, search, department, employeeId]);

  function handleExport() {
    exportEmployeesCSV();
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={onCreate}>Register New Employee</button>
        <button onClick={handleExport} style={{ marginLeft: 8 }}>Export CSV</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)} />
        <input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} style={{ marginLeft: 8 }} />
        <input placeholder="Employee ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)} style={{ marginLeft: 8 }} />
      </div>
      <table border={1} cellPadding={6} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>Start Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.employeeId}>
              <td>{e.employeeId}</td>
              <td>{e.fullName}</td>
              <td>{e.email}</td>
              <td>{e.department}</td>
              <td>{e.position}</td>
              <td>{e.startDate}</td>
              <td>
                <button onClick={() => onViewProfile(e.employeeId)}>View</button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && <tr><td colSpan={7}>No employees found.</td></tr>}
        </tbody>
      </table>
      <div style={{ marginTop: 16 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {page}</span>
        <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
