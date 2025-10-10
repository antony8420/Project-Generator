// Auth hook
import { useState } from 'react';

export function useAuth() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [employeeId, setEmployeeId] = useState(localStorage.getItem('employeeId'));
  const isAuthenticated = !!localStorage.getItem('token');
  return { isAuthenticated, role, employeeId };
}
