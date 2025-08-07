// actions/patient-files.ts
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from "@prisma/client";
import { PatientFile } from '@/types';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'exames');

const prisma = new PrismaClient();

export const uploadPatientFile = async (
  patientId: string,
  formData: FormData
): Promise<PatientFile> => {
  const file = formData.get('file') as File;
  const description = formData.get('description') as string | null;

  if (!file) {
    throw new Error('Nenhum arquivo enviado');
  }

  try {
    // Criar diretório do paciente se não existir
    const patientDir = path.join(UPLOAD_DIR, patientId);
    await fs.mkdir(patientDir, { recursive: true });

    // Gerar nome único para o arquivo
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.name);
    const fileName = `${uniqueSuffix}${extension}`;
    const filePath = path.join(patientDir, fileName);

    // Salvar arquivo no sistema
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Salvar metadados no banco de dados
    const patientFile = await prisma.patientFile.create({
      data: {
        patientId,
        fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: buffer.length,
        description: description || null,
      },
    });

    revalidatePath(`/dashboard/patient-record/${patientId}`);
    // Mapear para snake_case conforme PatientFile
    return {
      id: patientFile.id,
      patient_id: patientFile.patientId,
      file_name: patientFile.fileName,
      file_path: `/exames/${patientFile.patientId}/${patientFile.fileName}`,
      file_type: patientFile.fileType,
      file_size: patientFile.fileSize ?? undefined,
      description: patientFile.description ?? undefined,
      created_at: patientFile.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    throw new Error('Falha ao enviar arquivo');
  }
};

export const deletePatientFile = async (fileId: string) => {
  try {
    const file = await prisma.patientFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error('Arquivo não encontrado');
    }

    // Excluir arquivo físico
    const filePath = path.join(UPLOAD_DIR, file.patientId, file.fileName);
    await fs.unlink(filePath).catch((err) => {
      console.error(`Erro ao excluir arquivo físico: ${filePath}`, err);
    });

    // Excluir registro do banco
    await prisma.patientFile.delete({
      where: { id: fileId },
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    throw new Error('Falha ao excluir arquivo');
  }
};