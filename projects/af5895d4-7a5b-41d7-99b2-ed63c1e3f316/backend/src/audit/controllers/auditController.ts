import { Request, Response } from 'express';
import { getAuditLogs, createAuditLog } from '../services/auditService';
import { validateAuditLog } from '../utils/validation';

export async function listAuditLogs(req: Request, res: Response) {
  const logs = await getAuditLogs();
  res.json(logs);
}

export async function createAuditLogHandler(req: Request, res: Response) {
  const { valid, errors } = validateAuditLog(req.body);
  if (!valid) return res.status(400).json({ errors });
  const log = { ...req.body, timestamp: new Date().toISOString() };
  const created = await createAuditLog(log);
  res.status(201).json(created);
}
