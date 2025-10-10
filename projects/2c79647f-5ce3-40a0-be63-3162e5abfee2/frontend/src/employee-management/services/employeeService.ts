// Employee service for frontend
import axios from 'axios';

const API_URL = '/api/employees';

const listEmployees = async (page = 1, pageSize = 10) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(API_URL + `?page=${page}&pageSize=${pageSize}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const getEmployee = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export default { listEmployees, getEmployee };
