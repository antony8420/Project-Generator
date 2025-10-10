import axios from 'axios';
import { Employee } from '../types/Employee';

const BASE_URL = 'http://localhost:4000/api/employees';

export async function fetchEmployees(params: any) {
  const res = await axios.get(BASE_URL, { params });
  return res.data;
}

export async function fetchEmployee(id: string) {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
}

export async function createEmployee(data: Omit<Employee, 'id'>) {
  const res = await axios.post(BASE_URL, data);
  return res.data;
}

export async function updateEmployee(id: string, data: Omit<Employee, 'id'>) {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

export async function deleteEmployee(id: string) {
  await axios.delete(`${BASE_URL}/${id}`);
}

export async function exportEmployeesCSV() {
  const res = await axios.get(`${BASE_URL}/export`, { responseType: 'blob' });
  return res.data;
}
