import React from 'react';
import RegisterPatient from './patient-onboarding/pages/RegisterPatient';
import Calculator from './calculator/pages/Calculator';

function App() {
  return (
    <div>
      <h1>Patient Onboarding</h1>
      <RegisterPatient />
      <hr />
      <Calculator />
    </div>
  );
}

export default App;
