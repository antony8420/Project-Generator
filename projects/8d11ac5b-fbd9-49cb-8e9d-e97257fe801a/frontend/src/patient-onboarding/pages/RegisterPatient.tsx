import React from 'react';
import PatientRegistrationForm from '../components/PatientRegistrationForm';

const RegisterPatient: React.FC = () => {
  return (
    <div>
      <h2>Register as a Patient</h2>
      <PatientRegistrationForm />
    </div>
  );
};

export default RegisterPatient;