export interface FormInstance {
  id: string;
  template_id: string;
  patient_id: string;
  encounter_id: string;
  status: 'Open' | 'Locked' | 'Closed';
  created_by: string;
  created_on: string;
  locked_by: string | null;
  locked_on: string | null;
}
