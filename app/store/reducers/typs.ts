export interface UserInfo {
  id: number;
  username: string;
  email: string;
  identity: string;
  member_id: number;
  member_name: string;
  is_x_authorizationed: boolean;
  screen_name: string;
  profile_image_url: string;
  description: string | null;
  token: string;
}

export type Config = {
  region: any[];
  language: any[];
  character: any[];
  topics: any[];
  ability: any[];
  price: any[];
  kols: any[];
  limit: {
    post: number;
    repost: number;
    likes: number;
    quote: number;
    reply: number;
    comment: number;
    agent: number;
  };
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