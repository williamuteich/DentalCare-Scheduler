'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, Download, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { PatientFile } from '@/types';
import { deletePatientFile, uploadPatientFile } from '@/app/actions/patient-files';

import { useRouter } from 'next/navigation';

interface PatientFileUploadProps {
  patientId: string;
  files: PatientFile[];
}

const PatientFileUpload: React.FC<PatientFileUploadProps> = ({
  patientId,
  files
}) => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tipos de arquivo permitidos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Erro',
        description: 'Tipo de arquivo não permitido. Use imagens, PDF ou documentos do Office.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) {
        formData.append('description', description);
      }

      // Usar a server action
      await uploadPatientFile(patientId, formData);
      
      toast({
        title: 'Sucesso',
        description: 'Arquivo enviado com sucesso!',
      });
      setDescription('');
      setShowUploadDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = (file: PatientFile) => {
    const url = `/exames/${file.patient_id}/${file.file_name}?download=${encodeURIComponent(file.file_name)}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deletePatientFile(fileId);
      
      toast({
        title: 'Sucesso',
        description: 'Arquivo excluído com sucesso!',
      });
      router.refresh();
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível excluir o arquivo.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('word')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return '📊';
    }
    return '📁';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Arquivos do Paciente</h3>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className='cursor-pointer'>
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Arquivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Arquivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecionar Arquivo
                </label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  disabled={isUploading}
                  className='cursor-pointer'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: Imagens, PDF, Word, Excel (máximo 10MB)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição (opcional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição do arquivo..."
                  disabled={isUploading}
                />
              </div>
              {isUploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Enviando arquivo...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {files.length === 0 ? (
        <Card className='cursor-pointer'>
          <CardContent className="text-center py-8">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum arquivo enviado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <span className="text-2xl mr-2">{getFileIcon(file.file_type)}</span>
                  <span className="truncate">{file.file_name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {file.description && (
                  <p className="text-xs text-gray-600">{file.description}</p>
                )}
                <div className="text-xs text-gray-500">
                  <p>Tamanho: {formatFileSize(file.file_size || 0)}</p>
                  <p>Enviado: {new Date(file.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(file)}
                    className="flex-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3 mr-1 cursor-pointer" />
                    Baixar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 cursor-pointer">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este arquivo permanentemente?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientFileUpload;