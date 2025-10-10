import React from 'react';
import { Employee } from '../types/Employee';

interface Props {
  employees: Employee[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EmployeeTable: React.FC<Props> = ({ employees, onView, onEdit, onDelete }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
      {employees.map(emp => (
        <tr key={emp.id}>
          <td>{emp.id}</td>
          <td>{emp.fullName}</td>
          <td>{emp.department}</td>
          <td>{emp.position}</td>
          <td>{emp.startDate}</td>
          <td>
            <button onClick={() => onView(emp.id)}>View</button>
            <button onClick={() => onEdit(emp.id)}>Edit</button>
            <button onClick={() => onDelete(emp.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
