// Audit trail types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  changes: any;
}
