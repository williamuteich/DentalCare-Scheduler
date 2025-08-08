export interface PatientNote {
  id: string;
  patientId: string;        
  content: string;
  noteType: string;         
  createdAt: string;
  updatedAt?: string;
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
  observations?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  priority?: string;
  cost?: number;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;         
  title: string;
  description: string;
  status: string;
  estimatedCost?: number;    
  estimatedSessions?: number;
  createdAt: string;         
  updatedAt?: string;        
}
