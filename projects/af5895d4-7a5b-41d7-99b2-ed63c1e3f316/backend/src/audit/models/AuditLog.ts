export interface AuditLog {
  entity: string;
  operation: string;
  user: string;
  timestamp: string;
  details: string;
}
