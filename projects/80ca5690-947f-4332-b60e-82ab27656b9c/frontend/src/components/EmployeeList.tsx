import React, { useEffect, useState } from 'react';
import { Employee } from '../types/Employee';
import { fetchEmployees, deleteEmployee, exportEmployeesCSV } from '../services/employeeApi';
import { useNavigate } from 'react-router-dom';

interface Props {}

const PAGE_SIZE = 10;

const EmployeeList: React.FC<Props> = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<{ name?: string; department?: string; id?: string }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadEmployees = async () => {
    setLoading(true);
    const data = await fetchEmployees(page, PAGE_SIZE, search);
    setEmployees(data.employees);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this employee? This action can be undone only by admin.')) {
      await deleteEmployee(id);
      loadEmployees();
    }
  };

  const handleExport = async () => {
    const blob = await exportEmployeesCSV();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employees.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div>
      <h2>Employee List</h2>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="Name" onChange={e => setSearch(s => ({ ...s, name: e.target.value }))} />
        <input placeholder="Department" onChange={e => setSearch(s => ({ ...s, department: e.target.value }))} />
        <input placeholder="Employee ID" onChange={e => setSearch(s => ({ ...s, id: e.target.value }))} />
        <button onClick={() => setPage(1)}>Search</button>
        <button onClick={handleExport}>Export CSV</button>
        <button onClick={() => navigate('/register')}>Register Employee</button>
      </div>
      <table border={1} cellPadding={8} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Start Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6}>Loading...</td></tr>
          ) : employees.length === 0 ? (
            <tr><td colSpan={6}>No employees found.</td></tr>
          ) : employees.map(e => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.fullName}</td>
              <td>{e.department}</td>
              <td>{e.position}</td>
              <td>{e.startDate}</td>
              <td>
                <button onClick={() => navigate(`/profile/${e.id}`)}>View</button>
                <button onClick={() => navigate(`/edit/${e.id}`)}>Edit</button>
                <button onClick={() => handleDelete(e.id)}>Archive</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 16 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span> Page {page} of {Math.ceil(total / PAGE_SIZE)} </span>
        <button disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default EmployeeList;
