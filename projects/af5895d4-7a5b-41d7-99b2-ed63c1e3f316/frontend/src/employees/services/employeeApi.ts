import axios from 'axios';
import { Employee } from '../types/Employee';

const API_URL = 'http://localhost:4000/api/employees';

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await axios.get<Employee[]>(API_URL);
  return res.data;
}

export async function fetchEmployee(id: string): Promise<Employee> {
  const res = await axios.get<Employee>(`${API_URL}/${id}`);
  return res.data;
}

export async function createEmployee(data: Omit<Employee, 'id'>): Promise<Employee> {
  const res = await axios.post<Employee>(API_URL, data);
  return res.data;
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  const res = await axios.put<Employee>(`${API_URL}/${id}`, data);
  return res.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
