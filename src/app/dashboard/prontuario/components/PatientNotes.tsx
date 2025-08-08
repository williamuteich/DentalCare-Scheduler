"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, FileText, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PatientNote } from '@/types';
import { useRouter } from 'next/navigation';
import { addPatientNote, deletePatientNote, updatePatientNote } from '@/app/actions/patient-notes';
import { PatientNotesProps } from '@/types/client';


const PatientNotes: React.FC<PatientNotesProps> = ({ 
  patientId, 
  notes
}) => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    noteType: 'general' as 'general' | 'treatment' | 'payment' | 'alert'
  });

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite uma anotação.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingNote) {
        await updatePatientNote(editingNote.id, {
          content: formData.content,
          noteType: formData.noteType
        });
        toast({
          title: 'Sucesso',
          description: 'Anotação atualizada com sucesso!',
        });
      } else {
        await addPatientNote({
          patientId: patientId,
          content: formData.content,
          noteType: formData.noteType
        });
        toast({
          title: 'Sucesso',
          description: 'Anotação adicionada com sucesso!',
        });
      }

      setFormData({ content: '', noteType: 'general' });
      setEditingNote(null);
      setShowDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a anotação.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deletePatientNote(noteId);
      toast({
        title: 'Sucesso',
        description: 'Anotação excluída com sucesso!',
      });
      router.refresh();
    } catch (error) {
      console.error('Erro ao excluir anotação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a anotação.',
        variant: 'destructive',
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'treatment':
        return <Activity className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'treatment':
        return 'Tratamento';
      case 'payment':
        return 'Pagamento';
      case 'alert':
        return 'Alerta';
      default:
        return 'Geral';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'treatment':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({ content: '', noteType: 'general' });
    setEditingNote(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Anotações</h3>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Anotação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Editar Anotação' : 'Nova Anotação'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <Select 
                  value={formData.noteType} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    noteType: value as any 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="treatment">Tratamento</SelectItem>
                    <SelectItem value="payment">Pagamento</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Anotação</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    content: e.target.value 
                  })}
                  placeholder="Digite sua anotação..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingNote ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma anotação encontrada</p>
            <p className="text-sm text-gray-500">Clique em "Nova Anotação" para adicionar a primeira</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(note.noteType || 'general')}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(note.noteType || 'general')}`}>
                      {getTypeLabel(note.noteType || 'general')}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingNote(note);
                        setFormData({
                          content: note.content,
                          noteType: note.noteType as any
                        });
                        setShowDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta anotação permanentemente?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(note.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{note.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleString('pt-BR')}
                  {note.updatedAt && ` | Atualizada: ${new Date(note.updatedAt).toLocaleString('pt-BR')}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientNotes;