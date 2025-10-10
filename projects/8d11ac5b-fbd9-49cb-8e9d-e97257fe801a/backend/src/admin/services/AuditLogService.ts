import fs from 'fs/promises';
import path from 'path';
import { AuditLog } from '../models/AuditLog';
import { v4 as uuidv4 } from 'uuid';

const LOGS_PATH = path.join(__dirname, '../../../data/admin/audit-logs.json');

async function readLogs(): Promise<AuditLog[]> {
  try {
    const data = await fs.readFile(LOGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLogs(logs: AuditLog[]) {
  await fs.writeFile(LOGS_PATH, JSON.stringify(logs, null, 2));
}

export const AuditLogService = {
  async logAction(adminId: string, action: string, targetId: string, details: string) {
    const logs = await readLogs();
    const log: AuditLog = {
      logId: uuidv4(),
      adminId,
      action,
      targetId,
      timestamp: new Date().toISOString(),
      details
    };
    logs.push(log);
    await writeLogs(logs);
  },
  async getLogs(): Promise<AuditLog[]> {
    return await readLogs();
  }
};
