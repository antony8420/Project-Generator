export interface ReflexResponse {
  id: string;
  type: 'SendMail' | 'CreateOrder' | 'CreateCharge' | 'CreateMEDACTOrder';
  dept_id: string;
  item_id: string | null;
  repeat_settings: string;
  prompt_user_flag: boolean;
}

export interface Reflex {
  id: string;
  code: string;
  description: string;
  answer_range: string;
  time_range: string;
  responses: ReflexResponse[];
}
