import { PatientNote, ToothRecord, TreatmentPlan } from '@/types';
import { Client } from '@/types/client';
import PatientInfoCard from '../components/PatientInfoCard';
import PatientFileUpload from '../components/PatientFileUpload';
import ToothChart from '../components/ToothChart';
import PatientNotes from '../components/PatientNotes';
import TreatmentPlans from '../components/TreatmentPlans';
import { PrismaClient } from "@prisma/client";
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

interface PatientRecordPageProps {
  params: {
    id: string;
  };
}

export default async function PatientRecordPage({
  params,
}: PatientRecordPageProps) {
  const { id } = await params;

  try {
    const client = await prisma.clients.findUnique({
      where: { id },
      include: {
        files: true,
        toothRecords: true, 
      },
    });
    
    if (!client) return redirect('/dashboard/agenda');

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Prontuário de {client.name}</h1>
          <p className="text-gray-600 mt-1">
            ID: {id} | Cadastrado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <PatientInfoCard client={client} />
            <PatientFileUpload
              patientId={id}
              files={client.files.map((file: any) => ({
                id: file.id,
                patient_id: file.patientId,
                file_name: file.fileName,
                file_path: file.filePath,
                file_type: file.fileType,
                file_size: file.fileSize,
                description: file.description,
                created_at: file.createdAt,
                original_name: file.originalName,
              }))}
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ToothChart
              patientId={id}
              patientName={client.name}
              toothRecords={client.toothRecords.map(record => ({
                id: record.id,
                patient_id: record.patientId,
                tooth_number: record.toothNumber,
                procedure: record.procedure,
                observations: record.notes || '',
                status: record.status as any,
                created_at: record.createdAt.toISOString(),
                updated_at: record.updatedAt?.toISOString() || '',
              }))}
            />
            
            {/*
            <PatientNotes
              patientId={id}
              patientName={client.name}
              notes={notes}
            />
            <TreatmentPlans
              patientId={id}
              patientName={client.name}
              plans={treatmentPlans}
            />*/}
          </div> 
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return redirect('/dashboard/agenda');
  }
}