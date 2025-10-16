import { AuditLog } from '../models/AuditLog';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/audit.json';

export async function getAuditLogs(): Promise<AuditLog[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function createAuditLog(log: AuditLog): Promise<AuditLog> {
  const logs = await getAuditLogs();
  logs.push(log);
  await fs.writeFile(DATA_PATH, JSON.stringify(logs, null, 2));
  return log;
}
