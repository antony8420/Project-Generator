import React, { useEffect, useState } from 'react';
import { Employee } from '../types/employee';
import { fetchEmployeeById, deleteEmployee } from '../services/employeeApi';

interface Props {
  employeeId: string;
  onBack: () => void;
}

export default function EmployeeProfilePage({ employeeId, onBack }: Props) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    fetchEmployeeById(employeeId).then(setEmployee).catch(() => setError('Employee not found'));
  }, [employeeId]);

  async function handleDelete() {
    if (window.confirm('Delete this employee?')) {
      await deleteEmployee(employeeId);
      setDeleted(true);
      setTimeout(onBack, 1200);
    }
  }

  if (error) return <div>{error}</div>;
  if (!employee) return <div>Loading...</div>;
  if (deleted) return <div>Employee deleted.</div>;

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Employee Profile</h2>
      <div><b>Employee ID:</b> {employee.employeeId}</div>
      <div><b>Full Name:</b> {employee.fullName}</div>
      <div><b>Email:</b> {employee.email}</div>
      <div><b>Phone:</b> {employee.phone}</div>
      <div><b>Address:</b> {employee.address}</div>
      <div><b>Department:</b> {employee.department}</div>
      <div><b>Position:</b> {employee.position}</div>
      <div><b>Salary:</b> ${employee.salary}</div>
      <div><b>Start Date:</b> {employee.startDate}</div>
      <div style={{ marginTop: 16 }}>
        <button onClick={onBack}>Back</button>
        <button onClick={handleDelete} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
      </div>
    </div>
  );
}
