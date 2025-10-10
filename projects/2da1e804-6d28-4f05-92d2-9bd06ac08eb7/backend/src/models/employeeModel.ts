export interface Employee {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
}

export type EmployeeInput = Omit<Employee, 'employeeId'>;
