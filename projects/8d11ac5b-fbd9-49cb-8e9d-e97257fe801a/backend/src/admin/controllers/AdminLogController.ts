import { Request, Response } from 'express';
import { AuditLogService } from '../services/AuditLogService';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditLogService.getLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
