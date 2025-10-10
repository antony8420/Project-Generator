import express from 'express';
import { adminLogin } from '../controllers/AdminAuthController';
import { getPatients, getPatientDetail, verifyPatient, deactivatePatient, activatePatient } from '../controllers/AdminPatientController';
import { getDashboardMetrics } from '../controllers/AdminDashboardController';
import { getAuditLogs } from '../controllers/AdminLogController';
import { authenticateAdminToken, requireAdminRole } from '../middleware/adminAuth';

const router = express.Router();

// Public
router.post('/login', adminLogin);

// Protected
router.get('/dashboard', authenticateAdminToken, requireAdminRole(['SuperAdmin', 'Staff']), getDashboardMetrics);
router.get('/patients', authenticateAdminToken, requireAdminRole(['SuperAdmin', 'Staff']), getPatients);
router.get('/patients/:id', authenticateAdminToken, requireAdminRole(['SuperAdmin', 'Staff']), getPatientDetail);
router.patch('/patients/:id/verify', authenticateAdminToken, requireAdminRole(['SuperAdmin', 'Staff']), verifyPatient);
router.patch('/patients/:id/deactivate', authenticateAdminToken, requireAdminRole(['SuperAdmin', 'Staff']), deactivatePatient);
router.patch('/patients/:id/activate', authenticateAdminToken, requireAdminRole(['SuperAdmin', 'Staff']), activatePatient);
router.get('/logs', authenticateAdminToken, requireAdminRole(['SuperAdmin', 'Staff']), getAuditLogs);

export default router;
