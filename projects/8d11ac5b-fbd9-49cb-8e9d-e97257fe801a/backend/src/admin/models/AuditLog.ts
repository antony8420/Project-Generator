export interface AuditLog {
  logId: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: string;
  details: string;
}
