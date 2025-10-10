import React, { useState } from 'react';
import { Employee } from '../types/Employee';

interface Props {
  initial?: Partial<Employee>;
  onSubmit: (data: Omit<Employee, 'id'>) => void;
  errors?: string[];
}

export const EmployeeForm: React.FC<Props> = ({ initial = {}, onSubmit, errors = [] }) => {
  const [form, setForm] = useState<Omit<Employee, 'id'>>({
    fullName: initial.fullName || '',
    email: initial.email || '',
    phone: initial.phone || '',
    address: initial.address || '',
    department: initial.department || '',
    position: initial.position || '',
    salary: initial.salary || 0,
    startDate: initial.startDate || ''
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'salary' ? Number(value) : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      {errors.length > 0 && <div style={{ color: 'red' }}>{errors.join(', ')}</div>}
      <div>
        <label>Full Name*</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} required />
      </div>
      <div>
        <label>Email*</label>
        <input name="email" value={form.email} onChange={handleChange} required type="email" />
      </div>
      <div>
        <label>Phone*</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />
      </div>
      <div>
        <label>Address*</label>
        <input name="address" value={form.address} onChange={handleChange} required />
      </div>
      <div>
        <label>Department*</label>
        <input name="department" value={form.department} onChange={handleChange} required />
      </div>
      <div>
        <label>Position*</label>
        <input name="position" value={form.position} onChange={handleChange} required />
      </div>
      <div>
        <label>Salary*</label>
        <input name="salary" value={form.salary} onChange={handleChange} required type="number" min="0" />
      </div>
      <div>
        <label>Start Date*</label>
        <input name="startDate" value={form.startDate} onChange={handleChange} required type="date" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};
