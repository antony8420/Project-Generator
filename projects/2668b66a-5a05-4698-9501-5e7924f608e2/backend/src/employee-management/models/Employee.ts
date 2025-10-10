// Employee model
export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  archived: boolean;
}
