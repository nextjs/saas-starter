export interface UserInfo {
  id: number;
  username: string;
  email: string;
  identity: string;
  member_id: number;
  member_name: string;
  token: string;
}

export type Config = {
  region: any[];
  language: any[];
  character: any[];
  topics: any[];
  currentStep: number;
}

export type From = {
  step1: any;
  step2: any;
  step3: any;
  step4: any;
  step5: any;
  step6: any; 
}