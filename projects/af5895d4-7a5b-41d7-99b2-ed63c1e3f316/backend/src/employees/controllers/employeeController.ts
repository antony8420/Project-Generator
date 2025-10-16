import { Request, Response } from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../services/employeeService';
import { validateEmployee } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export async function listEmployees(req: Request, res: Response) {
  const employees = await getEmployees();
  res.json(employees);
}

export async function getEmployee(req: Request, res: Response) {
  const employee = await getEmployeeById(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json(employee);
}

export async function createEmployeeHandler(req: Request, res: Response) {
  const { valid, errors } = validateEmployee(req.body);
  if (!valid) return res.status(400).json({ errors });
  const employee = { ...req.body, id: uuidv4() };
  const created = await createEmployee(employee);
  res.status(201).json(created);
}

export async function updateEmployeeHandler(req: Request, res: Response) {
  const updated = await updateEmployee(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Employee not found' });
  res.json(updated);
}

export async function deleteEmployeeHandler(req: Request, res: Response) {
  const deleted = await deleteEmployee(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Employee not found' });
  res.json({ success: true });
}
