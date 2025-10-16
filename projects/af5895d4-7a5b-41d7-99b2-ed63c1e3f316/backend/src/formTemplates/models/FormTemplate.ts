export interface FormTemplate {
  id: string;
  code: string;
  title: string;
  version: number;
  status: 'Under Construction' | 'Live' | 'Obsolete';
  chartlink_tab: string;
  subcategory: string;
  permissions: string[];
  default_font: string;
  created_by: string;
  created_on: string;
}
