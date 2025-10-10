import { Request, Response } from 'express';
import { CalculatorService } from '../services/CalculatorService';

export const calculate = async (req: Request, res: Response) => {
  try {
    const { expression } = req.body;
    if (typeof expression !== 'string') {
      return res.status(400).json({ error: 'Expression must be a string.' });
    }
    const result = await CalculatorService.calculate(expression);
    res.json({ result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
