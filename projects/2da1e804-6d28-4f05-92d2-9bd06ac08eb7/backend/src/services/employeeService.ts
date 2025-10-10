import { Employee, EmployeeInput } from '../models/employeeModel';
import { readEmployees, writeEmployees } from '../data/employeeData';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

export async function listEmployees({ page, pageSize, search, department, employeeId }: {
  page: number;
  pageSize: number;
  search: string;
  department: string;
  employeeId: string;
}) {
  const employees = await readEmployees();
  let filtered = employees;
  if (search) {
    filtered = filtered.filter(e => e.fullName.toLowerCase().includes(search.toLowerCase()));
  }
  if (department) {
    filtered = filtered.filter(e => e.department === department);
  }
  if (employeeId) {
    filtered = filtered.filter(e => e.employeeId === employeeId);
  }
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  return { employees: paginated, total };
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const employees = await readEmployees();
  return employees.find(e => e.employeeId === id) || null;
}

export async function createEmployee(data: EmployeeInput): Promise<Employee> {
  const employees = await readEmployees();
  const employeeId = generateEmployeeId(employees);
  const newEmployee: Employee = { ...data, employeeId };
  employees.push(newEmployee);
  await writeEmployees(employees);
  return newEmployee;
}

export async function updateEmployee(id: string, data: EmployeeInput): Promise<Employee | null> {
  const employees = await readEmployees();
  const idx = employees.findIndex(e => e.employeeId === id);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...data };
  await writeEmployees(employees);
  return employees[idx];
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await readEmployees();
  const idx = employees.findIndex(e => e.employeeId === id);
  if (idx === -1) return false;
  employees.splice(idx, 1);
  await writeEmployees(employees);
  return true;
}

function generateEmployeeId(employees: Employee[]): string {
  // Generate sequential ID: EMP0001, EMP0002, ...
  const maxId = employees.reduce((max, e) => {
    const num = parseInt(e.employeeId.replace('EMP', ''));
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `EMP${(maxId + 1).toString().padStart(4, '0')}`;
}

export async function exportEmployeesCSV(): Promise<string> {
  const employees = await readEmployees();
  const csvWriter = createObjectCsvWriter({
    path: path.join(__dirname, '../../data/employees.csv'),
    header: [
      { id: 'employeeId', title: 'Employee ID' },
      { id: 'fullName', title: 'Full Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'address', title: 'Address' },
      { id: 'department', title: 'Department' },
      { id: 'position', title: 'Position' },
      { id: 'salary', title: 'Salary' },
      { id: 'startDate', title: 'Start Date' }
    ]
  });
  await csvWriter.writeRecords(employees);
  return path.join(__dirname, '../../data/employees.csv');
}
