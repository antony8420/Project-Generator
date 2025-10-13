import { Employee } from '../models/Employee';
import { createObjectCsvStringifier } from 'csv-writer';

export function employeesToCSV(employees: Employee[]): string {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'id', title: 'Employee ID' },
      { id: 'fullName', title: 'Full Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'address', title: 'Address' },
      { id: 'department', title: 'Department' },
      { id: 'position', title: 'Position' },
      { id: 'salary', title: 'Salary' },
      { id: 'startDate', title: 'Start Date' },
      { id: 'archivedAt', title: 'Archived At' }
    ]
  });
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(employees);
}
