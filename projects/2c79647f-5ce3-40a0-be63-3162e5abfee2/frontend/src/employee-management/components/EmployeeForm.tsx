// Employee form component
import React, { useState } from 'react';
import { Employee } from '../types/Employee';

interface Props {
  employee?: Employee;
  onSubmit: (data: Partial<Employee>) => void;
}

const EmployeeForm: React.FC<Props> = ({ employee, onSubmit }) => {
  const [form, setForm] = useState<Partial<Employee>>(employee || {});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input name="fullName" value={form.fullName || ''} onChange={handleChange} placeholder="Full Name" required />
      <input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email" required />
      <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone" required />
      <input name="address" value={form.address || ''} onChange={handleChange} placeholder="Address" required />
      <input name="department" value={form.department || ''} onChange={handleChange} placeholder="Department" required />
      <input name="position" value={form.position || ''} onChange={handleChange} placeholder="Position" required />
      <input name="salary" value={form.salary || ''} onChange={handleChange} placeholder="Salary" required type="number" />
      <input name="startDate" value={form.startDate || ''} onChange={handleChange} placeholder="Start Date" required type="date" />
      <button type="submit">{employee ? 'Update' : 'Create'} Employee</button>
    </form>
  );
};

export default EmployeeForm;
