import axios from 'axios';
import { Employee } from '../types/Employee';

const BASE_URL = '/api/employees';

export async function fetchEmployees(page = 1, pageSize = 10, search?: { name?: string; department?: string; id?: string }) {
  const params: any = { page, pageSize, ...search };
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

export async function updateEmployee(id: string, data: Partial<Employee>) {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

export async function deleteEmployee(id: string) {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
}

export async function exportEmployeesCSV() {
  const res = await axios.get(`${BASE_URL}/export`, { responseType: 'blob' });
  return res.data;
}
