import { Client } from '@/types/client';

export interface PatientNote {
  id: string;
  patient_id: string;
  content: string;
  note_type: string;
  created_at: string;
  updated_at?: string;
}

export interface PatientFile {
  id: string;
  patient_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  description?: string;
  created_at: string;
}

export interface ToothRecord {
  id: string;
  patient_id: string;
  tooth_number: number;
  procedure: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  title: string;
  description: string;
  status: string;
  estimated_cost?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}
