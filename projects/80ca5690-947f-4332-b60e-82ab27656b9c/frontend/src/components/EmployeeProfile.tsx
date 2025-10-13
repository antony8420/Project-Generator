import React, { useEffect, useState } from 'react';
import { Employee } from '../types/Employee';
import { fetchEmployee } from '../services/employeeApi';
import { useParams, useNavigate } from 'react-router-dom';

const EmployeeProfile: React.FC = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchEmployee(id).then(setEmployee);
    }
  }, [id]);

  if (!employee) return <div>Loading...</div>;

  return (
    <div>
      <h2>Employee Profile</h2>
      <table>
        <tbody>
          <tr><td>ID:</td><td>{employee.id}</td></tr>
          <tr><td>Name:</td><td>{employee.fullName}</td></tr>
          <tr><td>Email:</td><td>{employee.email}</td></tr>
          <tr><td>Phone:</td><td>{employee.phone}</td></tr>
          <tr><td>Address:</td><td>{employee.address}</td></tr>
          <tr><td>Department:</td><td>{employee.department}</td></tr>
          <tr><td>Position:</td><td>{employee.position}</td></tr>
          <tr><td>Salary:</td><td>{employee.salary}</td></tr>
          <tr><td>Start Date:</td><td>{employee.startDate}</td></tr>
          {employee.archivedAt && (
            <tr><td>Status:</td><td style={{color:'red'}}>Archived on {new Date(employee.archivedAt).toLocaleString()}</td></tr>
          )}
        </tbody>
      </table>
      <button onClick={() => navigate('/')}>Back</button>
      <button onClick={() => navigate(`/edit/${employee.id}`)} disabled={!!employee.archivedAt}>Edit</button>
    </div>
  );
};

export default EmployeeProfile;
