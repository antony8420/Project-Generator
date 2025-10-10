// Employee service
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Employee } from '../models/Employee';
import AuditTrailService from './AuditTrailService';

const EMPLOYEES_PATH = path.join(__dirname, '../../../data/employee-management/employees.json');

async function getEmployees(): Promise<Employee[]> {
  try {
    const data = await fs.readFile(EMPLOYEES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveEmployees(employees: Employee[]) {
  await fs.writeFile(EMPLOYEES_PATH, JSON.stringify(employees, null, 2));
}

export default {
  listEmployees: async (page: number, pageSize: number) => {
    const employees = await getEmployees();
    const start = (page - 1) * pageSize;
    return {
      total: employees.length,
      employees: employees.slice(start, start + pageSize)
    };
  },
  searchEmployees: async (q: string) => {
    const employees = await getEmployees();
    return employees.filter(e =>
      e.fullName.toLowerCase().includes(q.toLowerCase()) ||
      e.department.toLowerCase().includes(q.toLowerCase()) ||
      e.id.toLowerCase().includes(q.toLowerCase())
    );
  },
  getEmployeeById: async (id: string) => {
    const employees = await getEmployees();
    return employees.find(e => e.id === id);
  },
  createEmployee: async (data: any) => {
    // Validate required fields
    const required = ['fullName', 'email', 'phone', 'address', 'department', 'position', 'salary', 'startDate'];
    for (const field of required) {
      if (!data[field]) throw new Error(`${field} is required`);
    }
    // Email format validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) throw new Error('Invalid email format');
    const employees = await getEmployees();
    // Automated Employee ID generation
    const id = 'EMP' + (employees.length + 1).toString().padStart(5, '0');
    const now = new Date().toISOString();
    const employee: Employee = {
      id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      department: data.department,
      position: data.position,
      salary: Number(data.salary),
      startDate: data.startDate,
      createdAt: now,
      updatedAt: now
    };
    employees.push(employee);
    await saveEmployees(employees);
    return employee;
  },
  updateEmployee: async (id: string, data: any, user: any) => {
    const employees = await getEmployees();
    const idx = employees.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    const old = { ...employees[idx] };
    // Only HR Admin can change salary and position
    if (('salary' in data || 'position' in data) && user.role !== 'HR_ADMIN') {
      throw new Error('Forbidden: Only HR Admin can change salary or position');
    }
    // Employees can only update their own contact info
    if (user.role === 'EMPLOYEE' && user.employeeId !== id) {
      throw new Error('Forbidden: Employees can only update their own profile');
    }
    // Update fields
    for (const key of Object.keys(data)) {
      if (key in employees[idx]) {
        (employees[idx] as any)[key] = data[key];
      }
    }
    employees[idx].updatedAt = new Date().toISOString();
    await saveEmployees(employees);
    await AuditTrailService.recordChange(id, user.id, old, employees[idx]);
    return employees[idx];
  },
  deleteEmployee: async (id: string) => {
    const employees = await getEmployees();
    const idx = employees.findIndex(e => e.id === id);
    if (idx === -1) return;
    employees.splice(idx, 1);
    await saveEmployees(employees);
  },
  exportCSV: async () => {
    const employees = await getEmployees();
    const header = 'Employee ID,Full Name,Email,Phone,Address,Department,Position,Salary,Start Date,Created At,Updated At';
    const rows = employees.map(e =>
      [e.id, e.fullName, e.email, e.phone, e.address, e.department, e.position, e.salary, e.startDate, e.createdAt, e.updatedAt].join(',')
    );
    return [header, ...rows].join('\n');
  }
};
