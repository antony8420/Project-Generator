import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminService } from '../services/AdminService';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export function authenticateAdminToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err: any, payload: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.admin = payload;
    next();
  });
}

export function requireAdminRole(roles: ('SuperAdmin' | 'Staff')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
}

export function generateAdminToken(admin: { adminId: string; name: string; email: string; role: string }) {
  return jwt.sign({ adminId: admin.adminId, name: admin.name, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
}
