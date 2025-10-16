import { Router } from 'express';
import { listEmployees, getEmployee, createEmployeeHandler, updateEmployeeHandler, deleteEmployeeHandler } from '../controllers/employeeController';

export const employeeRoutes = Router();

employeeRoutes.get('/', listEmployees);
employeeRoutes.get('/:id', getEmployee);
employeeRoutes.post('/', createEmployeeHandler);
employeeRoutes.put('/:id', updateEmployeeHandler);
employeeRoutes.delete('/:id', deleteEmployeeHandler);
