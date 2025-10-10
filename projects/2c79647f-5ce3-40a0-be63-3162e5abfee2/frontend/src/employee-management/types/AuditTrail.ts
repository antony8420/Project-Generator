// AuditTrail type
export interface AuditTrail {
  id: string;
  employeeId: string;
  changedBy: string;
  timestamp: string;
  changes: Record<string, { oldValue: any; newValue: any }>;
}
