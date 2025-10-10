import React, { useEffect, useState } from 'react';
import { Employee } from '../types/Employee';
import { fetchEmployee } from '../services/employeeApi';

interface Props {
  id: string;
  onBack: () => void;
}

export const EmployeeProfilePage: React.FC<Props> = ({ id, onBack }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployee(id).then(setEmployee);
  }, [id]);

  if (!employee) return <div>Loading...</div>;

  return (
    <div>
      <h2>Employee Profile</h2>
      <button onClick={onBack}>Back</button>
      <div>
        <strong>ID:</strong> {employee.id}<br />
        <strong>Name:</strong> {employee.fullName}<br />
        <strong>Email:</strong> {employee.email}<br />
        <strong>Phone:</strong> {employee.phone}<br />
        <strong>Address:</strong> {employee.address}<br />
        <strong>Department:</strong> {employee.department}<br />
        <strong>Position:</strong> {employee.position}<br />
        <strong>Salary:</strong> ${employee.salary}<br />
        <strong>Start Date:</strong> {employee.startDate}<br />
      </div>
    </div>
  );
};
