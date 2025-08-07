import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabaseService, TreatmentPlan } from '@/lib/supabase-service';

interface TreatmentPlansProps {
  patientId: string;
  patientName: string;
  plans: TreatmentPlan[];
  onPlansUpdate: () => void;
}

const TreatmentPlans: React.FC<TreatmentPlansProps> = ({ 
  patientId, 
  patientName, 
  plans,
  onPlansUpdate
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedCost: '',
    estimatedSessions: '',
    status: 'draft' as 'draft' | 'approved' | 'in-progress' | 'completed'
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha o título e a descrição.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const planData = {
        title: formData.title,
        description: formData.description,
        estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : 0,
        estimated_sessions: formData.estimatedSessions ? parseInt(formData.estimatedSessions) : 1,
        status: formData.status
      };

      if (editingPlan) {
        await supabaseService.updateTreatmentPlan(editingPlan.id, planData);
      } else {
        await supabaseService.addTreatmentPlan({
          ...planData,
          patient_id: patientId
        });
      }

      toast({
        title: 'Sucesso',
        description: editingPlan ? 'Plano atualizado com sucesso!' : 'Plano adicionado com sucesso!',
      });

      resetForm();
      setShowDialog(false);
      onPlansUpdate();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o plano de tratamento.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (plan: TreatmentPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      estimatedCost: plan.estimated_cost?.toString() || '',
      estimatedSessions: plan.estimated_sessions?.toString() || '',
      status: plan.status as 'draft' | 'approved' | 'in-progress' | 'completed'
    });
    setShowDialog(true);
  };

  const handleDelete = async (planId: string) => {
    try {
      await supabaseService.deleteTreatmentPlan(planId);
      toast({
        title: 'Sucesso',
        description: 'Plano excluído com sucesso!',
      });
      onPlansUpdate();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plano de tratamento.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'approved':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in-progress':
        return 'Em Andamento';
      case 'approved':
        return 'Aprovado';
      default:
        return 'Rascunho';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      estimatedCost: '',
      estimatedSessions: '',
      status: 'draft'
    });
    setEditingPlan(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Planos de Tratamento</h3>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano de Tratamento' : 'Novo Plano de Tratamento'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do plano..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do tratamento..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custo Estimado (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sessões</label>
                  <Input
                    type="number"
                    value={formData.estimatedSessions}
                    onChange={(e) => setFormData({ ...formData, estimatedSessions: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
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
                  {editingPlan ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum plano de tratamento encontrado</p>
            <p className="text-sm text-gray-500">Clique em "Novo Plano" para adicionar o primeiro</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(plan.status || 'draft')}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status || 'draft')}`}>
                        {getStatusLabel(plan.status || 'draft')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este plano de tratamento permanentemente?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(plan.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{plan.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Custo Estimado:</span>
                    <p className="text-gray-600">
                      {plan.estimated_cost 
                        ? `R$ ${parseFloat(plan.estimated_cost.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'Não informado'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Sessões Estimadas:</span>
                    <p className="text-gray-600">{plan.estimatedSessions || 1}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-gray-500">
                  <span>Criado: {new Date(plan.created_at || '').toLocaleDateString('pt-BR')}</span>
                  {plan.updated_at && plan.updated_at !== plan.created_at && (
                    <span>Atualizado: {new Date(plan.updated_at).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentPlans;