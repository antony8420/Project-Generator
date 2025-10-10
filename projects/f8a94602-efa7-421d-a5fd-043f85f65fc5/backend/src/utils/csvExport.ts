import { Employee } from '../models/Employee';

export function employeesToCSV(employees: Employee[]): string {
  const headers = [
    'Employee ID', 'Full Name', 'Email', 'Phone', 'Address',
    'Department', 'Position', 'Salary', 'Start Date'
  ];
  const rows = employees.map(emp => [
    emp.id, emp.fullName, emp.email, emp.phone, emp.address,
    emp.department, emp.position, emp.salary.toString(), emp.startDate
  ]);
  return [headers.join(','), ...rows.map(r => r.map(field => `"${field}"`).join(','))].join('\n');
}
