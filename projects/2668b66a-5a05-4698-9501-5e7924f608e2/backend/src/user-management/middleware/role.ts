// Role-based access control middleware
import { Request, Response, NextFunction } from 'express';

export function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // ...implementation
  };
}
