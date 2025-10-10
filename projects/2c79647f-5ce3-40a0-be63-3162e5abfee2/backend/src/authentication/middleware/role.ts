// Role-based access middleware
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export default function (roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
