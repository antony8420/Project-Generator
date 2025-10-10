// Auth service for frontend
import axios from 'axios';

const API_URL = '/api/auth';

const login = async (username: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('role', res.data.role);
  localStorage.setItem('employeeId', res.data.employeeId || '');
  return res.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('employeeId');
};

export default { login, logout };
