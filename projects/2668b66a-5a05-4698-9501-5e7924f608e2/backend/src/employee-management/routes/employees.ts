// Employee management routes
import { Router } from 'express';
import EmployeeController from '../controllers/EmployeeController';
import { authenticateJWT } from '../../authentication/middleware/auth';
import { authorizeRoles } from '../../user-management/middleware/role';
import employeeValidation from '../middleware/employeeValidation';

const router = Router();

router.get('/', authenticateJWT, EmployeeController.listEmployees);
router.get('/:id', authenticateJWT, EmployeeController.getEmployee);
router.post('/', authenticateJWT, authorizeRoles('HR_ADMIN'), employeeValidation, EmployeeController.createEmployee);
router.put('/:id', authenticateJWT, authorizeRoles('HR_ADMIN', 'MANAGER', 'EMPLOYEE'), employeeValidation, EmployeeController.updateEmployee);
router.delete('/:id', authenticateJWT, authorizeRoles('HR_ADMIN'), EmployeeController.deleteEmployee);
router.get('/export/csv', authenticateJWT, authorizeRoles('HR_ADMIN', 'MANAGER'), EmployeeController.exportCSV);

export default router;
