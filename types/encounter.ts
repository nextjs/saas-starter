export interface Encounter {
  id: string;
  chartId?: string;
  patientName?: string;
  dob?: string;
  provider?: string;
  status?: string;
  notes?: string;
  encounter?: string;
  aiCodes?: AiCode[];
  codes?: BillingCode[];
}

export type EncounterStatus = 'Active' | 'Pending' | 'Completed' | 'Inactive' | 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'INACTIVE';

export interface AiCode {
  code: string;
  description?: string;
  audit?: string;
  icdCodes?: string[];
}

export interface BillingCode {
  code: string;
  description: string;
  audit?: string;
  icdCodes?: string[];
}

export interface CodeEvidence {
  id: string;
  evidence: string;
  context: string;
}

// API response interface
export interface EncounterApiResponse {
  id: string;
  chart_id?: string;
  patient_name?: string;
  dob?: string;
  provider?: string;
  status?: string;
  notes?: string;
  encounter?: string;
  ai_codes?: {
    code: string;
    description?: string;
    audit?: string;
    evidence?: string;
    icdCodes?: string[];
  }[];
  codes?: {
    code: string;
    id?: string;
    description: string;
    audit?: string;
    evidence?: string;
    icdCodes?: string[];
  }[];
}

// Function to transform API response to Encounter type
export function transformEncounterFromApi(data: any): Encounter {
  return {
    id: data.id || '',
    chartId: data.chartId || data.chart_id || '',
    patientName: data.patientName || data.patient_name || '',
    dob: data.dob || '',
    provider: data.provider || '',
    status: data.status || '',
    notes: data.notes || '',
    encounter: data.encounter || '',
    aiCodes: data.aiCodes || data.ai_codes || [],
    codes: data.codes || [],
  };
}
