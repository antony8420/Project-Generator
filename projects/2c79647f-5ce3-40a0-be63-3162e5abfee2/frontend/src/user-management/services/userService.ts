// User service for frontend
import axios from 'axios';

const API_URL = '/api/users';

const listUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export default { listUsers };
