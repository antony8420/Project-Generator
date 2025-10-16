import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';
import { createEmployee, fetchEmployee, updateEmployee } from '../services/employeeApi';
import { Employee } from '../types/Employee';

const EmployeeFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [initial, setInitial] = useState<Partial<Employee>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editId) {
      setLoading(true);
      fetchEmployee(editId).then(emp => {
        setInitial(emp);
        setLoading(false);
      });
    }
  }, [editId]);

  async function handleSubmit(data: Omit<Employee, 'id'>) {
    setLoading(true);
    if (editId) {
      await updateEmployee(editId, data);
    } else {
      await createEmployee(data);
    }
    setLoading(false);
    navigate('/employees');
  }

  return <EmployeeForm initial={initial} onSubmit={handleSubmit} loading={loading} />;
};

export default EmployeeFormPage;
