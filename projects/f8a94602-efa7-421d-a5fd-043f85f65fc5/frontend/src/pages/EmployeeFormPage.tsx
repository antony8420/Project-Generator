import React, { useState, useEffect } from 'react';
import { Employee } from '../types/Employee';
import { EmployeeForm } from '../components/EmployeeForm';
import { createEmployee, updateEmployee, fetchEmployee } from '../services/employeeApi';

interface Props {
  id?: string;
  onBack: () => void;
}

export const EmployeeFormPage: React.FC<Props> = ({ id, onBack }) => {
  const [initial, setInitial] = useState<Partial<Employee>>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (id) fetchEmployee(id).then(setInitial);
  }, [id]);

  async function handleSubmit(data: Omit<Employee, 'id'>) {
    try {
      if (id) {
        await updateEmployee(id, data);
      } else {
        await createEmployee(data);
      }
      onBack();
    } catch (e: any) {
      setErrors(e.response?.data?.errors || ['Unknown error']);
    }
  }

  return (
    <div>
      <h2>{id ? 'Edit Employee' : 'Register Employee'}</h2>
      <button onClick={onBack}>Back</button>
      <EmployeeForm initial={initial} onSubmit={handleSubmit} errors={errors} />
    </div>
  );
};
