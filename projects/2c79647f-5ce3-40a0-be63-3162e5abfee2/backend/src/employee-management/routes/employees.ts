// Employee management routes
import express from 'express';
import EmployeeController from '../controllers/EmployeeController';
import auth from '../../authentication/middleware/auth';
import role from '../../authentication/middleware/role';

const router = express.Router();

router.get('/', auth, role(['HR_ADMIN', 'MANAGER']), EmployeeController.listEmployees);
router.get('/search', auth, role(['HR_ADMIN', 'MANAGER']), EmployeeController.searchEmployees);
router.get('/:id', auth, EmployeeController.getEmployee);
router.post('/', auth, role(['HR_ADMIN']), EmployeeController.createEmployee);
router.put('/:id', auth, role(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']), EmployeeController.updateEmployee);
router.delete('/:id', auth, role(['HR_ADMIN']), EmployeeController.deleteEmployee);
router.get('/:id/audit', auth, role(['HR_ADMIN', 'MANAGER']), EmployeeController.getAuditTrail);
router.get('/export/csv', auth, role(['HR_ADMIN', 'MANAGER']), EmployeeController.exportCSV);

export default router;
