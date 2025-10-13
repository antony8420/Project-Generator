import { Employee } from '../models/Employee';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/employees.json';

export async function getAllEmployees(): Promise<Employee[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data).filter((e: Employee) => e.isActive !== false);
}

export async function getAllEmployeesRaw(): Promise<Employee[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function saveAllEmployees(employees: Employee[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(employees, null, 2));
}

export async function addEmployee(employee: Employee): Promise<Employee> {
  const employees = await getAllEmployeesRaw();
  employee.isActive = true;
  await saveAllEmployees([...employees, employee]);
  return employee;
}

export async function updateEmployee(id: string, updated: Partial<Employee>): Promise<Employee | null> {
  const employees = await getAllEmployeesRaw();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...updated };
  await saveAllEmployees(employees);
  return employees[idx];
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await getAllEmployeesRaw();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return false;
  if (employees[idx].isActive === false) return false;
  employees[idx].isActive = false;
  employees[idx].archivedAt = new Date().toISOString();
  await saveAllEmployees(employees);
  return true;
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const employees = await getAllEmployeesRaw();
  const emp = employees.find(e => e.id === id);
  return emp && emp.isActive !== false ? emp : null;
}

export async function searchEmployees(query: { name?: string; department?: string; id?: string }): Promise<Employee[]> {
  const employees = await getAllEmployees();
  return employees.filter(e => {
    const matchName = query.name ? e.fullName.toLowerCase().includes(query.name.toLowerCase()) : true;
    const matchDept = query.department ? e.department.toLowerCase().includes(query.department.toLowerCase()) : true;
    const matchId = query.id ? e.id === query.id : true;
    return matchName && matchDept && matchId;
  });
}
