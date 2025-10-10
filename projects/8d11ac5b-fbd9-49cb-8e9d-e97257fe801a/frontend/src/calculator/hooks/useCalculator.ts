import { useState } from 'react';
import { calculate as apiCalculate } from '../services/calculatorService';

export default function useCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  async function calculate(expression: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiCalculate(expression);
      setResult(res.result);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return { calculate, loading, error, result };
}
