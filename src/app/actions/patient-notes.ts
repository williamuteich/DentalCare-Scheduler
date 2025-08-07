'use server'

import prisma from '@/lib/prisma';
import { PatientNote } from '@/types';

export const addPatientNote = async (
  noteData: Omit<PatientNote, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    return await prisma.patientNote.create({
      data: {
        patientId: noteData.patientId,
        content: noteData.content,
        noteType: noteData.noteType // Corrigido para noteType
      },
    });
  } catch (error) {
    console.error('Error adding note:', error);
    throw new Error('Failed to add note');
  }
};

export const updatePatientNote = async (
  id: string,
  noteData: Partial<PatientNote>
) => {
  try {
    return await prisma.patientNote.update({
      where: { id },
      data: {
        content: noteData.content,
        noteType: noteData.noteType // Corrigido para noteType
      },
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note');
  }
};

export const deletePatientNote = async (id: string) => {
  try {
    await prisma.patientNote.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
};