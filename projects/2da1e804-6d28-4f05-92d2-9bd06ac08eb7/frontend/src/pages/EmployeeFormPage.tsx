import React, { useState } from 'react';
import { EmployeeInput } from '../types/employee';
import { createEmployee } from '../services/employeeApi';

interface Props {
  onBack: () => void;
}

const initialState: EmployeeInput = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  department: '',
  position: '',
  salary: 0,
  startDate: ''
};

export default function EmployeeFormPage({ onBack }: Props) {
  const [form, setForm] = useState<EmployeeInput>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'salary' ? Number(value) : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createEmployee(form);
      setSuccess(true);
      setTimeout(onBack, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register employee');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
      <h2>Register New Employee</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Employee registered!</div>}
      <div>
        <label>Full Name*</label><br />
        <input name="fullName" value={form.fullName} onChange={handleChange} required />
      </div>
      <div>
        <label>Email*</label><br />
        <input name="email" value={form.email} onChange={handleChange} required type="email" />
      </div>
      <div>
        <label>Phone*</label><br />
        <input name="phone" value={form.phone} onChange={handleChange} required />
      </div>
      <div>
        <label>Address*</label><br />
        <input name="address" value={form.address} onChange={handleChange} required />
      </div>
      <div>
        <label>Department*</label><br />
        <input name="department" value={form.department} onChange={handleChange} required />
      </div>
      <div>
        <label>Position*</label><br />
        <input name="position" value={form.position} onChange={handleChange} required />
      </div>
      <div>
        <label>Salary*</label><br />
        <input name="salary" value={form.salary} onChange={handleChange} required type="number" min={0} />
      </div>
      <div>
        <label>Start Date*</label><br />
        <input name="startDate" value={form.startDate} onChange={handleChange} required type="date" />
      </div>
      <div style={{ marginTop: 16 }}>
        <button type="submit">Register</button>
        <button type="button" onClick={onBack} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </form>
  );
}
