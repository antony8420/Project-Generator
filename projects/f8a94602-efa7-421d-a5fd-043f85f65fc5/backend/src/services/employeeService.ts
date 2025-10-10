import { Employee } from '../models/Employee';
import fs from 'fs/promises';
const DATA_PATH = __dirname + '/../data/employees.json';

export async function readEmployees(): Promise<Employee[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function writeEmployees(employees: Employee[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(employees, null, 2));
}
