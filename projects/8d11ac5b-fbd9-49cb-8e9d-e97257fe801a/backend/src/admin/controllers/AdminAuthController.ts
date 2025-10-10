import { Request, Response } from 'express';
import { AdminService } from '../services/AdminService';
import { generateAdminToken } from '../middleware/adminAuth';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const admin = await AdminService.authenticate(email, password);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    await AdminService.updateLastLogin(admin.adminId);
    const token = generateAdminToken(admin);
    res.json({ admin: { adminId: admin.adminId, name: admin.name, email: admin.email, role: admin.role }, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
