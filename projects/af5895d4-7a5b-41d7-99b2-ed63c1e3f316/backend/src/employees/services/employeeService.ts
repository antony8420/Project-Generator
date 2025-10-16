import { Employee } from '../models/Employee';
import fs from 'fs/promises';
//const DATA_PATH = 'backend/data/employees.json';
const DATA_PATH = 'data/employees.json';

export async function getEmployees(): Promise<Employee[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  const employees = await getEmployees();
  return employees.find(e => e.id === id);
}

export async function createEmployee(employee: Employee): Promise<Employee> {
  const employees = await getEmployees();
  employees.push(employee);
  await fs.writeFile(DATA_PATH, JSON.stringify(employees, null, 2));
  return employee;
}

export async function updateEmployee(id: string, update: Partial<Employee>): Promise<Employee | undefined> {
  const employees = await getEmployees();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  employees[idx] = { ...employees[idx], ...update };
  await fs.writeFile(DATA_PATH, JSON.stringify(employees, null, 2));
  return employees[idx];
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await getEmployees();
  const filtered = employees.filter(e => e.id !== id);
  if (filtered.length === employees.length) return false;
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
