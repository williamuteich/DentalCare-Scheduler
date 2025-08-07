// actions/treatment-plans.ts
'use server'

import prisma from '@/lib/prisma';
import { TreatmentPlan } from '@/types';

export const addTreatmentPlan = async (
  planData: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    return await prisma.treatmentPlan.create({
      data: {
        patientId: planData.patientId,
        title: planData.title,
        description: planData.description,
        status: planData.status,
        estimatedCost: planData.estimatedCost,
        estimatedSessions: planData.estimatedSessions,
      },
    });
  } catch (error) {
    console.error('Error adding treatment plan:', error);
    throw new Error('Failed to add treatment plan');
  }
};

export const updateTreatmentPlan = async (
  id: string,
  planData: Partial<TreatmentPlan>
) => {
  try {
    return await prisma.treatmentPlan.update({
      where: { id },
      data: {
        title: planData.title,
        description: planData.description,
        status: planData.status,
        estimatedCost: planData.estimatedCost,
        estimatedSessions: planData.estimatedSessions,
      },
    });
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    throw new Error('Failed to update treatment plan');
  }
};

export const deleteTreatmentPlan = async (id: string) => {
  try {
    await prisma.treatmentPlan.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting treatment plan:', error);
    throw new Error('Failed to delete treatment plan');
  }
};