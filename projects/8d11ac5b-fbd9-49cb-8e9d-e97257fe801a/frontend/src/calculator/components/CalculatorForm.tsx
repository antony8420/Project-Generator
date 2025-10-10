import React, { useState } from 'react';
import useCalculator from '../hooks/useCalculator';

const CalculatorForm: React.FC = () => {
  const [expression, setExpression] = useState('');
  const { calculate, loading, error, result } = useCalculator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculate(expression);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="expression"
        placeholder="Enter expression (e.g. 2+2*3)"
        value={expression}
        onChange={e => setExpression(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>Calculate</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {result !== null && <div>Result: {result}</div>}
    </form>
  );
};

export default CalculatorForm;
