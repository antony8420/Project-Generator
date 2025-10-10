export interface Admin {
  adminId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'SuperAdmin' | 'Staff';
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}
