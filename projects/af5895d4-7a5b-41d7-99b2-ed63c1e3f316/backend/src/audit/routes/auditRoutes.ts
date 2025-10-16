import { Router } from 'express';
import { listAuditLogs, createAuditLogHandler } from '../controllers/auditController';

export const auditRoutes = Router();

auditRoutes.get('/', listAuditLogs);
auditRoutes.post('/', createAuditLogHandler);
