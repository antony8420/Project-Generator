import React from 'react';
import { Employee } from '../types/Employee';

interface Props {
  employee: Employee;
}

const EmployeeProfile: React.FC<Props> = ({ employee }) => (
  <div style={{ maxWidth: 400 }}>
    <h2>Employee Profile</h2>
    <p><strong>Name:</strong> {employee.name}</p>
    <p><strong>Role:</strong> {employee.role}</p>
    <p><strong>Department:</strong> {employee.department}</p>
    <p><strong>Email:</strong> {employee.email}</p>
  </div>
);

export default EmployeeProfile;
