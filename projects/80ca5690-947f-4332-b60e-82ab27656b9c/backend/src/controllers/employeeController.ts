import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as employeeService from '../services/employeeService';
import { employeesToCSV } from '../utils/csvExport';

export async function createEmployee(req: Request, res: Response) {
  try {
    const id = uuidv4();
    const employee = { id, ...req.body };
    await employeeService.addEmployee(employee);
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create employee.' });
  }
}

export async function getEmployees(req: Request, res: Response) {
  try {
    const { page = '1', pageSize = '10', name, department, id } = req.query;
    let employees = await employeeService.getAllEmployees();
    if (name || department || id) {
      employees = await employeeService.searchEmployees({ name: name as string, department: department as string, id: id as string });
    }
    const p = Number(page);
    const ps = Number(pageSize);
    const total = employees.length;
    const paginated = employees.slice((p - 1) * ps, p * ps);
    res.json({ employees: paginated, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees.' });
  }
}

export async function getEmployee(req: Request, res: Response) {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee.' });
  }
}

export async function updateEmployee(req: Request, res: Response) {
  try {
    const updated = await employeeService.updateEmployee(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Employee not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update employee.' });
  }
}

export async function deleteEmployee(req: Request, res: Response) {
  try {
    const deleted = await employeeService.deleteEmployee(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found or already deleted.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee.' });
  }
}

export async function exportEmployeesCSV(req: Request, res: Response) {
  try {
    const employees = await employeeService.getAllEmployees();
    const csv = employeesToCSV(employees);
    res.header('Content-Type', 'text/csv');
    res.attachment('employees.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
}
