import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmployeeProfile from '../components/EmployeeProfile';
import { fetchEmployee } from '../services/employeeApi';
import { Employee } from '../types/Employee';

const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEmployee(id).then(emp => {
        setEmployee(emp);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>Employee not found.</p>;
  return <EmployeeProfile employee={employee} />;
};

export default EmployeeProfilePage;
