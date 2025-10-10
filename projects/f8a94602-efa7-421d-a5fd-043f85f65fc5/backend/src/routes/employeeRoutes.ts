import express from 'express';
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  exportEmployeesCSV
} from '../controllers/employeeController';

const router = express.Router();

router.get('/', listEmployees);
router.get('/export', exportEmployeesCSV);
router.get('/:id', getEmployee);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
