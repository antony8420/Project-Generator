// Employee profile component
import React from 'react';
import { Employee } from '../types/Employee';

const EmployeeProfile: React.FC<{ employee: Employee }> = ({ employee }) => (
  <div>
    <h2>{employee.fullName}</h2>
    <p>Email: {employee.email}</p>
    <p>Phone: {employee.phone}</p>
    <p>Address: {employee.address}</p>
    <p>Department: {employee.department}</p>
    <p>Position: {employee.position}</p>
    <p>Salary: {employee.salary}</p>
    <p>Start Date: {employee.startDate}</p>
    <p>Created At: {employee.createdAt}</p>
    <p>Updated At: {employee.updatedAt}</p>
  </div>
);

export default EmployeeProfile;
