import { Request, Response, NextFunction } from 'express';

export function validateEmployee(req: Request, res: Response, next: NextFunction) {
  const { fullName, email, phone, address, department, position, salary, startDate } = req.body;
  if (!fullName || !email || !phone || !address || !department || !position || !salary || !startDate) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (isNaN(Number(salary)) || Number(salary) <= 0) {
    return res.status(400).json({ error: 'Salary must be a positive number.' });
  }
  next();
}
