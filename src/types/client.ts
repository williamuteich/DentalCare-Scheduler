export interface Client {
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