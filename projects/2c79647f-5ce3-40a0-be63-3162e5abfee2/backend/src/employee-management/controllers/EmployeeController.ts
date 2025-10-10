// Employee controller
import { Request, Response } from 'express';
import EmployeeService from '../services/EmployeeService';
import AuditTrailService from '../services/AuditTrailService';

export default {
  listEmployees: async (req: Request, res: Response) => {
    const { page = 1, pageSize = 10 } = req.query;
    const result = await EmployeeService.listEmployees(Number(page), Number(pageSize));
    res.json(result);
  },
  searchEmployees: async (req: Request, res: Response) => {
    const { q } = req.query;
    const result = await EmployeeService.searchEmployees(q as string);
    res.json(result);
  },
  getEmployee: async (req: Request, res: Response) => {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Not found' });
    res.json(employee);
  },
  createEmployee: async (req: Request, res: Response) => {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
  updateEmployee: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const updated = await EmployeeService.updateEmployee(req.params.id, req.body, user);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
  deleteEmployee: async (req: Request, res: Response) => {
    await EmployeeService.deleteEmployee(req.params.id);
    res.status(204).send();
  },
  getAuditTrail: async (req: Request, res: Response) => {
    const audit = await AuditTrailService.getAuditTrail(req.params.id);
    res.json(audit);
  },
  exportCSV: async (req: Request, res: Response) => {
    const csv = await EmployeeService.exportCSV();
    res.header('Content-Type', 'text/csv');
    res.attachment('employees.csv');
    res.send(csv);
  }
};
