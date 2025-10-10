// Audit trail routes
import { Router } from 'express';
import AuditController from '../controllers/AuditController';
import { authenticateJWT } from '../../authentication/middleware/auth';
import { authorizeRoles } from '../../user-management/middleware/role';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('HR_ADMIN'), AuditController.listAuditLogs);

export default router;
