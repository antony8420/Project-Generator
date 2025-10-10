// Employee detail page
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import employeeService from '../services/employeeService';
import EmployeeProfile from '../components/EmployeeProfile';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  useEffect(() => {
    if (id) employeeService.getEmployee(id).then(setEmployee);
  }, [id]);
  if (!employee) return <div>Loading...</div>;
  return <EmployeeProfile employee={employee} />;
};

export default EmployeeDetail;
