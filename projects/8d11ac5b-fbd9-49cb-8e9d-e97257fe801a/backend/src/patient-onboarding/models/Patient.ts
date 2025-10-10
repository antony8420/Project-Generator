export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  address: string;
  profilePhotoUrl?: string;
  idDocumentUrl?: string;
  createdAt: string;
}