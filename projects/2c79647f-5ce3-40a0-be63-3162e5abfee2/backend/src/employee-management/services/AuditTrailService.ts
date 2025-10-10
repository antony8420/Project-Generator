// Audit trail service
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AuditTrail } from '../models/AuditTrail';

const AUDIT_PATH = path.join(__dirname, '../../../data/employee-management/audit.json');

async function getAudit(): Promise<AuditTrail[]> {
  try {
    const data = await fs.readFile(AUDIT_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveAudit(audit: AuditTrail[]) {
  await fs.writeFile(AUDIT_PATH, JSON.stringify(audit, null, 2));
}

export default {
  recordChange: async (employeeId: string, changedBy: string, oldData: any, newData: any) => {
    const audit = await getAudit();
    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    for (const key of Object.keys(newData)) {
      if (oldData[key] !== newData[key]) {
        changes[key] = { oldValue: oldData[key], newValue: newData[key] };
      }
    }
    if (Object.keys(changes).length === 0) return;
    audit.push({
      id: uuidv4(),
      employeeId,
      changedBy,
      timestamp: new Date().toISOString(),
      changes
    });
    await saveAudit(audit);
  },
  getAuditTrail: async (employeeId: string) => {
    const audit = await getAudit();
    return audit.filter(a => a.employeeId === employeeId);
  }
};
