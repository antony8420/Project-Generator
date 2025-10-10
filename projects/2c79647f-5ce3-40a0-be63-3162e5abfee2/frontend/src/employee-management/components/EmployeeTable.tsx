// Employee table component
import React from 'react';
import { Employee } from '../types/Employee';

interface Props {
  employees: Employee[];
  onSelect: (id: string) => void;
}

const EmployeeTable: React.FC<Props> = ({ employees, onSelect }) => (
  <table>
    <thead>
      <tr>
        <th>Employee ID</th>
        <th>Full Name</th>
        <th>Department</th>
        <th>Position</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {employees.map(e => (
        <tr key={e.id}>
          <td>{e.id}</td>
          <td>{e.fullName}</td>
          <td>{e.department}</td>
          <td>{e.position}</td>
          <td><button onClick={() => onSelect(e.id)}>View</button></td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default EmployeeTable;
