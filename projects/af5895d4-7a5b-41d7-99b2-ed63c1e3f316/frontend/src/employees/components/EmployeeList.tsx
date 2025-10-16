import React from 'react';
import { Employee } from '../types/Employee';
import { Link } from 'react-router-dom';

interface Props {
  employees: Employee[];
  onDelete: (id: string) => void;
  loading: boolean;
}

const EmployeeList: React.FC<Props> = ({ employees, onDelete, loading }) => (
  <div>
    <h2>Employees</h2>
    {loading ? <p>Loading...</p> : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
              <td>{emp.department}</td>
              <td>{emp.email}</td>
              <td>
                <Link to={`/employees/${emp.id}`}>View</Link> |
                <Link to={`/employees/new?edit=${emp.id}`}>Edit</Link> |
                <button onClick={() => onDelete(emp.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    <Link to="/employees/new" style={{ display: 'inline-block', marginTop: 16 }}>Add Employee</Link>
  </div>
);

export default EmployeeList;
