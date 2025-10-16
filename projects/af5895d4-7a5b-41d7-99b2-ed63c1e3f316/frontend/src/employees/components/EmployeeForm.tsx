import React, { useState } from 'react';
import { Employee } from '../types/Employee';
import { validateEmployee } from '../utils/validation';

interface Props {
  initial?: Partial<Employee>;
  onSubmit: (data: Omit<Employee, 'id'>) => void;
  loading: boolean;
}

const EmployeeForm: React.FC<Props> = ({ initial = {}, onSubmit, loading }) => {
  const [form, setForm] = useState<Omit<Employee, 'id'>>({
    name: initial.name || '',
    role: initial.role || '',
    department: initial.department || '',
    email: initial.email || ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateEmployee(form);
    setErrors(errs);
    if (errs.length === 0) onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h2>{initial.id ? 'Edit Employee' : 'Add Employee'}</h2>
      <div>
        <label>Name</label><br />
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Role</label><br />
        <input name="role" value={form.role} onChange={handleChange} required />
      </div>
      <div>
        <label>Department</label><br />
        <input name="department" value={form.department} onChange={handleChange} required />
      </div>
      <div>
        <label>Email</label><br />
        <input name="email" value={form.email} onChange={handleChange} required type="email" />
      </div>
      {errors.length > 0 && (
        <ul style={{ color: 'red' }}>{errors.map(e => <li key={e}>{e}</li>)}</ul>
      )}
      <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default EmployeeForm;
