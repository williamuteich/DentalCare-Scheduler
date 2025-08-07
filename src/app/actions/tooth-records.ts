'use server';

import { PrismaClient } from "@prisma/client";
import { ToothRecord } from '@/types';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export const addToothRecord = async (record: Omit<ToothRecord, 'id' | 'created_at' | 'completed_at'>) => {
  try {
    const newRecord = await prisma.toothRecord.create({
      data: {
        patientId: record.patient_id,
        toothNumber: record.tooth_number,
        procedure: record.procedure,
        notes: record.observations || null,
        status: record.status,
      },
    });

    revalidatePath(`/dashboard/patient-record/${record.patient_id}`);
    return {
      id: newRecord.id,
      patient_id: newRecord.patientId,
      tooth_number: newRecord.toothNumber,
      procedure: newRecord.procedure,
      observations: newRecord.notes || '',
      status: newRecord.status,
      created_at: newRecord.createdAt.toISOString(),
      updated_at: newRecord.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Erro ao adicionar registro dentário:', error);
    throw new Error('Não foi possível adicionar o registro dentário');
  }
};

export const updateToothRecord = async (recordId: string, record: Partial<ToothRecord>) => {
  try {
    const updatedRecord = await prisma.toothRecord.update({
      where: { id: recordId },
      data: {
        status: record.status,
        notes: record.observations || null,
      },
    });

    revalidatePath(`/dashboard/patient-record/${record.patient_id}`);
    return {
      id: updatedRecord.id,
      patient_id: updatedRecord.patientId,
      tooth_number: updatedRecord.toothNumber,
      procedure: updatedRecord.procedure,
      observations: updatedRecord.notes || '',
      status: updatedRecord.status,
      created_at: updatedRecord.createdAt.toISOString(),
      updated_at: updatedRecord.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Erro ao atualizar registro dentário:', error);
    throw new Error('Não foi possível atualizar o registro dentário');
  }
};