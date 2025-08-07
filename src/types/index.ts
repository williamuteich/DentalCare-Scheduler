// Re-export types from supabase-service for compatibility
export type { 
  PatientNote, 
  ToothRecord, 
  TreatmentPlan, 
  PatientFile
} from '@/lib/supabase-service';

// Re-export Client as Patient for backward compatibility
export type { Client as Patient } from '@/types/client';

// Additional types can be added here if needed
