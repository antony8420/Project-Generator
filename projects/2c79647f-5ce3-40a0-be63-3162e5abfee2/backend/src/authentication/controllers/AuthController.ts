// Auth controller
import AuthService from '../services/AuthService';
import { Request, Response } from 'express';

export default {
  login: async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
      const result = await AuthService.login(username, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
};
