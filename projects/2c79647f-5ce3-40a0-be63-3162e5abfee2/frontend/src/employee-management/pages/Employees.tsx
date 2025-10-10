// Employees page
import React, { useEffect, useState } from 'react';
import employeeService from '../services/employeeService';
import EmployeeTable from '../components/EmployeeTable';
import { useNavigate } from 'react-router-dom';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    employeeService.listEmployees().then(data => setEmployees(data.employees));
  }, []);
  return (
    <div>
      <h1>Employees</h1>
      <EmployeeTable employees={employees} onSelect={id => navigate(`/employees/${id}`)} />
    </div>
  );
};

export default Employees;
