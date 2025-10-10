import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { generateToken } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      logError('Registration failed: Missing username or password', { body: req.body });
      return res.status(400).json({ error: 'Missing username or password' });
    }
    const user = await AuthService.register(username, password, role);
    const token = generateToken(user);
    logInfo('User registered', { userId: user.id, username: user.username, role: user.role });
    res.status(201).json({ user: { id: user.id, username: user.username, role: user.role }, token });
  } catch (err: any) {
    logError('Registration error', { error: err.message, body: req.body });
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      logError('Login failed: Missing username or password', { body: req.body });
      return res.status(400).json({ error: 'Missing username or password' });
    }
    const user = await AuthService.authenticate(username, password);
    if (!user) {
      logError('Login failed: Invalid credentials', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    logInfo('User logged in', { userId: user.id, username: user.username });
    res.json({ user: { id: user.id, username: user.username, role: user.role }, token });
  } catch (err: any) {
    logError('Login error', { error: err.message, body: req.body });
    res.status(400).json({ error: err.message });
  }
};
