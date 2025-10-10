import fs from 'fs/promises';
const AUDIT_PATH = __dirname + '/../data/auditTrail.json';

export interface AuditTrailRecord {
  action: 'create' | 'update' | 'delete';
  employeeId: string;
  timestamp: string;
  changes?: any;
  before?: any;
  actor?: string;
  restrictedFields?: string[];
}

export async function appendAuditTrail(record: AuditTrailRecord): Promise<void> {
  let records: AuditTrailRecord[] = [];
  try {
    const data = await fs.readFile(AUDIT_PATH, 'utf-8');
    records = JSON.parse(data);
  } catch (e) {
    records = [];
  }
  records.push(record);
  await fs.writeFile(AUDIT_PATH, JSON.stringify(records, null, 2));
}
