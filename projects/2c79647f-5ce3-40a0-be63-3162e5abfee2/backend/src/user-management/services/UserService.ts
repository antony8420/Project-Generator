// User service
import fs from 'fs/promises';
import path from 'path';
import { UserProfile } from '../models/UserProfile';

const USERS_PATH = path.join(__dirname, '../../../data/authentication/users.json');

export default {
  listUsers: async (): Promise<UserProfile[]> => {
    const data = await fs.readFile(USERS_PATH, 'utf-8');
    return JSON.parse(data);
  },
  getUserById: async (id: string): Promise<UserProfile | undefined> => {
    const data = await fs.readFile(USERS_PATH, 'utf-8');
    const users: UserProfile[] = JSON.parse(data);
    return users.find(u => u.id === id);
  }
};
