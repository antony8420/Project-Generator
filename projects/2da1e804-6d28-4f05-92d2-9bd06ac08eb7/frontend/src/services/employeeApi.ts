import axios from 'axios';
import { Employee, EmployeeInput } from '../types/employee';

const BASE_URL = 'http://localhost:4000/api/employees';

export async function fetchEmployees(params: {
  page: number;
  pageSize: number;
  search?: string;
  department?: string;
  employeeId?: string;
}): Promise<{ employees: Employee[]; total: number }> {
  const res = await axios.get(BASE_URL, { params });
  return res.data;
}

export async function fetchEmployeeById(id: string): Promise<Employee> {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
}

export async function createEmployee(data: EmployeeInput): Promise<Employee> {
  const res = await axios.post(BASE_URL, data);
  return res.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}

export function exportEmployeesCSV() {
  window.open(`${BASE_URL}/export`, '_blank');
}
