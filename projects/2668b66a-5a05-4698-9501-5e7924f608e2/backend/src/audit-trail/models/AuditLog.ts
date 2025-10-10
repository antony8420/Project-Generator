// Audit log model
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  changes: any;
}
