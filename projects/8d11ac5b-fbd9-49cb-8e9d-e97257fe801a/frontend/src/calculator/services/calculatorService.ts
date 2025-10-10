import axios from 'axios';

export async function calculate(expression: string): Promise<{ result: number }> {
  const res = await axios.post('/api/calculator/calculate', { expression });
  return res.data;
}
