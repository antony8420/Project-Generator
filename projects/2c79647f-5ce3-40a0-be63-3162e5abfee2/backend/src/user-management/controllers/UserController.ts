// User controller
import { Request, Response } from 'express';
import UserService from '../services/UserService';

export default {
  listUsers: async (req: Request, res: Response) => {
    const users = await UserService.listUsers();
    res.json(users);
  },
  getMe: async (req: Request, res: Response) => {
    const user = await UserService.getUserById((req as any).user.id);
    res.json(user);
  }
};
