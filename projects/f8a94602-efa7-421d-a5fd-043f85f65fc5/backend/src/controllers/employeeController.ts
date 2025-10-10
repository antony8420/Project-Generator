import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { readEmployees, writeEmployees } from '../services/employeeService';
import { validateEmployee } from '../utils/validation';
import { generateEmployeeId } from '../utils/idGenerator';
import { employeesToCSV } from '../utils/csvExport';
import { appendAuditTrail } from '../services/auditTrailService';

export async function listEmployees(req: Request, res: Response) {
  const { page = '1', pageSize = '10', search = '', department = '', id = '' } = req.query;
  const employees = await readEmployees();
  let filtered = employees;
  if (search) {
    filtered = filtered.filter(e => e.fullName.toLowerCase().includes((search as string).toLowerCase()));
  }
  if (department) {
    filtered = filtered.filter(e => e.department === department);
  }
  if (id) {
    filtered = filtered.filter(e => e.id === id);
  }
  const p = parseInt(page as string);
  const ps = parseInt(pageSize as string);
  const paginated = filtered.slice((p - 1) * ps, p * ps);
  res.json({ employees: paginated, total: filtered.length });
}

export async function getEmployee(req: Request, res: Response) {
  const { id } = req.params;
  const employees = await readEmployees();
  const employee = employees.find(e => e.id === id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json(employee);
}

export async function createEmployee(req: Request, res: Response) {
  const data = req.body;
  const { valid, errors } = validateEmployee(data);
  if (!valid) return res.status(400).json({ errors });
  const id = await generateEmployeeId();
  const newEmployee: Employee = { ...data, id };
  const employees = await readEmployees();
  employees.push(newEmployee);
  await writeEmployees(employees);
  // BEGIN USER CODE
  await appendAuditTrail({
    action: 'create',
    employeeId: id,
    timestamp: new Date().toISOString(),
    changes: newEmployee,
    actor: req.headers['x-actor'] || 'system'
  });
  // END USER CODE
  res.status(201).json(newEmployee);
}

export async function updateEmployee(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;
  const { valid, errors } = validateEmployee(data);
  if (!valid) return res.status(400).json({ errors });
  const employees = await readEmployees();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });
  const oldEmployee = employees[idx];
  employees[idx] = { ...employees[idx], ...data, id };
  await writeEmployees(employees);
  // BEGIN USER CODE
  // Only HR Admin can change salary and position
  const actorRole = req.headers['x-role'] || 'user';
  let restrictedFields: string[] = [];
  if ((data.salary !== undefined && data.salary !== oldEmployee.salary) || (data.position && data.position !== oldEmployee.position)) {
    if (actorRole !== 'HR Admin') {
      return res.status(403).json({ error: 'Only HR Admin can change salary and position.' });
    }
    restrictedFields = ['salary', 'position'];
  }
  await appendAuditTrail({
    action: 'update',
    employeeId: id,
    timestamp: new Date().toISOString(),
    changes: data,
    before: oldEmployee,
    actor: req.headers['x-actor'] || 'system',
    restrictedFields
  });
  // END USER CODE
  res.json(employees[idx]);
}

export async function deleteEmployee(req: Request, res: Response) {
  const { id } = req.params;
  const employees = await readEmployees();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });
  employees.splice(idx, 1);
  await writeEmployees(employees);
  // BEGIN USER CODE
  await appendAuditTrail({
    action: 'delete',
    employeeId: id,
    timestamp: new Date().toISOString(),
    actor: req.headers['x-actor'] || 'system'
  });
  // END USER CODE
  res.status(204).send();
}

export async function exportEmployeesCSV(req: Request, res: Response) {
  const employees = await readEmployees();
  const csv = employeesToCSV(employees);
  res.header('Content-Type', 'text/csv');
  res.attachment('employees.csv');
  res.send(csv);
}
