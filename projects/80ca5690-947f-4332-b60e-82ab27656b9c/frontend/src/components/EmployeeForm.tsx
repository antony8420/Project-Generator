import React, { useState } from 'react';
import { Employee } from '../types/Employee';
import { createEmployee, updateEmployee, fetchEmployee } from '../services/employeeApi';
import { validateEmployee } from '../utils/validateEmployee';
import { useNavigate, useParams } from 'react-router-dom';

interface Props {
  editMode?: boolean;
}

const EmployeeForm: React.FC<Props> = ({ editMode }) => {
  const [form, setForm] = useState<Partial<Employee>>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  React.useEffect(() => {
    if (editMode && id) {
      fetchEmployee(id).then(e => setForm(e));
    }
  }, [editMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'salary' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmployee(form);
    if (err) {
      setError(err);
      return;
    }
    try {
      if (editMode && id) {
        await updateEmployee(id, form);
      } else {
        await createEmployee(form as Omit<Employee, 'id'>);
      }
      navigate('/');
    } catch {
      setError('Failed to save employee.');
    }
  };

  return (
    <div>
      <h2>{editMode ? 'Edit Employee' : 'Register Employee'}</h2>
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Full Name" value={form.fullName || ''} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email || ''} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone || ''} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address || ''} onChange={handleChange} />
        <input name="department" placeholder="Department" value={form.department || ''} onChange={handleChange} />
        <input name="position" placeholder="Position" value={form.position || ''} onChange={handleChange} />
        <input name="salary" type="number" placeholder="Salary" value={form.salary || ''} onChange={handleChange} />
        <input name="startDate" type="date" placeholder="Start Date" value={form.startDate || ''} onChange={handleChange} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">{editMode ? 'Update' : 'Register'}</button>
        <button type="button" onClick={() => navigate('/')}>Cancel</button>
      </form>
    </div>
  );
};

export default EmployeeForm;
