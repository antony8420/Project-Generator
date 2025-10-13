import express from 'express';
import * as employeeController from '../controllers/employeeController';
import { validateEmployee } from '../middleware/validateEmployee';
const router = express.Router();

router.get('/', employeeController.getEmployees);
router.get('/export', employeeController.exportEmployeesCSV);
router.get('/:id', employeeController.getEmployee);
router.post('/', validateEmployee, employeeController.createEmployee);
router.put('/:id', validateEmployee, employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
