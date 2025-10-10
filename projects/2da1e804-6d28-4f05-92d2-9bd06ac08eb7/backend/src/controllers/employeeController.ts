import { Request, Response } from 'express';
import * as employeeService from '../services/employeeService';
import { validateEmployee } from '../utils/validation';

export async function listEmployees(req: Request, res: Response) {
  const { page = '1', pageSize = '10', search = '', department = '', employeeId = '' } = req.query;
  const result = await employeeService.listEmployees({
    page: Number(page),
    pageSize: Number(pageSize),
    search: String(search),
    department: String(department),
    employeeId: String(employeeId)
  });
  res.json(result);
}

export async function getEmployeeById(req: Request, res: Response) {
  const employee = await employeeService.getEmployeeById(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json(employee);
}

export async function createEmployee(req: Request, res: Response) {
  const { error } = validateEmployee(req.body, true);
  if (error) return res.status(400).json({ error });
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json(employee);
}

export async function updateEmployee(req: Request, res: Response) {
  const { error } = validateEmployee(req.body, false);
  if (error) return res.status(400).json({ error });
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json(employee);
}

export async function deleteEmployee(req: Request, res: Response) {
  const success = await employeeService.deleteEmployee(req.params.id);
  if (!success) return res.status(404).json({ error: 'Employee not found' });
  res.json({ success: true });
}

export async function exportEmployeesCSV(req: Request, res: Response) {
  const csvPath = await employeeService.exportEmployeesCSV();
  res.download(csvPath, 'employees.csv');
}
