import fs from 'fs/promises';
import path from 'path';
import { Employee } from '../models/employeeModel';

const DATA_PATH = path.join(__dirname, '../../data/employees.json');

export async function readEmployees(): Promise<Employee[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function writeEmployees(employees: Employee[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(employees, null, 2));
}
