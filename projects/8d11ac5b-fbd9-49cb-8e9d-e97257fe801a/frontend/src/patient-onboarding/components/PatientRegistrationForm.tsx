import React, { useState } from 'react';
import { Patient } from '../types/Patient';
import usePatientRegistration from '../hooks/usePatientRegistration';

const initialForm: Partial<Patient> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: 'Other',
  dob: '',
  address: ''
};

const PatientRegistrationForm: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const { registerPatient, loading, error, patient } = usePatientRegistration();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'profilePhoto' && e.target.files) {
      setProfilePhoto(e.target.files[0]);
    }
    if (e.target.name === 'idDocument' && e.target.files) {
      setIdDocument(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerPatient(form, profilePhoto, idDocument);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
      <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
      <select name="gender" value={form.gender} onChange={handleChange} required>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input name="dob" type="date" value={form.dob} onChange={handleChange} required />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
      <input name="profilePhoto" type="file" accept="image/*" onChange={handleFileChange} />
      <input name="idDocument" type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>Register</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {patient && <div>Registered! Patient ID: {patient.id}</div>}
    </form>
  );
};

export default PatientRegistrationForm;