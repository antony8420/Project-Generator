import { Router } from 'express';
import * as employeeController from '../controllers/employeeController';

const router = Router();

router.get('/', employeeController.listEmployees);
router.get('/export', employeeController.exportEmployeesCSV);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
