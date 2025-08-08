import type { PatientNote, ToothRecord, TreatmentPlan } from '@/types';

export interface Client {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birthDate: Date | null;
  address: string | null;
  historico: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  active: boolean;
  createdAt: Date;
}

export interface PatientNotesProps {
  patientId: string;
  patientName: string;
  notes: PatientNote[];
}

export interface ToothChartProps {
  patientId: string;
  patientName: string;
  toothRecords: ToothRecord[];
}

export interface TreatmentPlansProps {
  patientId: string;
  patientName: string;
  plans: TreatmentPlan[];
}