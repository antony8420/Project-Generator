import { Employee } from '../models/Employee';
import { readEmployees } from '../services/employeeService';

export async function generateEmployeeId(): Promise<string> {
  const employees = await readEmployees();
  const maxId = employees.reduce((max, emp) => {
    const num = parseInt(emp.id.replace('EMP', ''));
    return num > max ? num : max;
  }, 0);
  const nextId = maxId + 1;
  return `EMP${nextId.toString().padStart(4, '0')}`;
}
