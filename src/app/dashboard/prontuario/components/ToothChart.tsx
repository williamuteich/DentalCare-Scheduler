// components/ToothChart.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ToothRecord } from '@/types';
import { useRouter } from 'next/navigation';
import { addToothRecord, updateToothRecord } from '@/app/actions/tooth-records';

const procedures = [
  'Cárie',
  'Restauração',
  'Canal',
  'Extração',
  'Limpeza',
  'Clareamento',
  'Ortodontia',
  'Prótese',
  'Implante',
  'Gengivite',
  'Periodontite',
  'Faceta',
];

const priorities = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' },
];

const statusOptions = [
  { value: 'planned', label: 'Planejado', icon: Clock, color: 'text-blue-600' },
  { value: 'in-progress', label: 'Em Andamento', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'completed', label: 'Concluído', icon: CheckCircle, color: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'text-red-600' },
];

interface ToothChartProps {
  patientId: string;
  patientName: string;
  toothRecords: ToothRecord[];
}

const ToothChart: React.FC<ToothChartProps> = ({ 
  patientId, 
  patientName, 
  toothRecords: initialToothRecords
}) => {
  const router = useRouter();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [procedure, setProcedure] = useState('');
  const [observations, setObservations] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [cost, setCost] = useState('');
  const [selectedToothRecords, setSelectedToothRecords] = useState<ToothRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<ToothRecord | null>(null);
  const [toothRecords, setToothRecords] = useState<ToothRecord[]>(initialToothRecords);

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    const toothHistory = toothRecords.filter(record => record.tooth_number === toothNumber);
    setSelectedToothRecords(toothHistory);
    setShowModal(true);
  };

  const handleAddRecord = async () => {
    if (!selectedTooth || !procedure) {
      toast({
        title: 'Erro',
        description: 'Selecione um procedimento.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newRecord = {
        patient_id: patientId,
        tooth_number: selectedTooth,
        procedure,
        observations,
        status: 'planned' as const,
        priority,
        cost: cost ? parseFloat(cost) : undefined,
      };

      // Adicionar ao banco de dados
      const createdRecord = await addToothRecord(newRecord);
      
      // Atualizar estado local
      const updatedRecords = [...toothRecords, createdRecord];
      setToothRecords(updatedRecords);
      
      // Atualizar registros do dente selecionado
      const updatedToothHistory = [...selectedToothRecords, createdRecord];
      setSelectedToothRecords(updatedToothHistory);

      toast({
        title: 'Sucesso',
        description: 'Procedimento adicionado com sucesso!',
      });

      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o procedimento.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRecord = async (record: ToothRecord, newStatus: ToothRecord['status']) => {
    try {
      const updatedRecord = {
        ...record,
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : record.completed_at,
      };

      // Atualizar no banco de dados
      const savedRecord = await updateToothRecord(record.id, updatedRecord);
      
      // Atualizar estado local
      const updatedRecords = toothRecords.map(r => 
        r.id === record.id ? savedRecord : r
      );
      setToothRecords(updatedRecords);
      
      // Atualizar lista local do dente selecionado
      const updatedSelectedRecords = selectedToothRecords.map(r => 
        r.id === record.id ? savedRecord : r
      );
      setSelectedToothRecords(updatedSelectedRecords);

      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso!',
      });
      
      // Recarregar dados na página
      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setProcedure('');
    setObservations('');
    setPriority('medium');
    setCost('');
    setEditingRecord(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTooth(null);
    resetForm();
    setSelectedToothRecords([]);
  };

  const getToothColor = (toothNumber: number) => {
    const records = toothRecords.filter(record => record.tooth_number === toothNumber);
    if (records.length === 0) return '#f3f4f6'; // Cinza claro (normal)
    
    const hasUrgent = records.some(record => record.priority === 'urgent');
    if (hasUrgent) return '#dc2626'; // Vermelho para urgente
    
    const hasPlanned = records.some(record => record.status === 'planned');
    const hasInProgress = records.some(record => record.status === 'in-progress');
    const hasCompleted = records.some(record => record.status === 'completed');
    
    if (hasInProgress) return '#f59e0b'; // Amarelo (em andamento)
    if (hasPlanned && hasCompleted) return '#8b5cf6'; // Roxo (misto)
    if (hasPlanned) return '#3b82f6'; // Azul (planejado)
    if (hasCompleted) return '#10b981'; // Verde (concluído)
    
    return '#f3f4f6';
  };

  const renderTooth = (number: number, isUpper: boolean = true) => {
    const color = getToothColor(number);
    const recordsCount = toothRecords.filter(r => r.tooth_number === number).length;
    
    return (
      <div
        key={number}
        className="relative cursor-pointer hover:scale-110 transition-transform group"
        onClick={() => handleToothClick(number)}
      >
        <div
          className="w-8 h-10 rounded-t-lg border-2 border-gray-400 flex items-center justify-center text-xs font-semibold relative"
          style={{ backgroundColor: color }}
          title={`Dente ${number}${recordsCount > 0 ? ` (${recordsCount} procedimento${recordsCount > 1 ? 's' : ''})` : ''}`}
        >
          {number}
          {recordsCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {recordsCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusIcon = (status: ToothRecord['status']) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    if (!statusConfig) return null;
    const Icon = statusConfig.icon;
    return <Icon className={`h-4 w-4 ${statusConfig.color}`} />;
  };

  const getPriorityBadge = (priority: ToothRecord['priority']) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    if (!priorityConfig) return null;
    return (
      <Badge className={priorityConfig.color}>
        {priorityConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">
          Odontograma - {patientName}
        </h3>
        
        {/* Legenda */}
        <div className="flex justify-center flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 border mr-2"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 border mr-2"></div>
            <span>Planejado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 border mr-2"></div>
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 border mr-2"></div>
            <span>Concluído</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 border mr-2"></div>
            <span>Urgente</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 border mr-2"></div>
            <span>Misto</span>
          </div>
        </div>

        {/* Dentes Superiores */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2">Dentes Superiores</div>
          <div className="flex justify-center space-x-2">
            <div className="flex space-x-1">
              {[18, 17, 16, 15, 14, 13, 12, 11].map(num => renderTooth(num))}
            </div>
            <div className="w-4"></div>
            <div className="flex space-x-1">
              {[21, 22, 23, 24, 25, 26, 27, 28].map(num => renderTooth(num))}
            </div>
          </div>
        </div>

        {/* Dentes Inferiores */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Dentes Inferiores</div>
          <div className="flex justify-center space-x-2">
            <div className="flex space-x-1">
              {[48, 47, 46, 45, 44, 43, 42, 41].map(num => renderTooth(num, false))}
            </div>
            <div className="w-4"></div>
            <div className="flex space-x-1">
              {[31, 32, 33, 34, 35, 36, 37, 38].map(num => renderTooth(num, false))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Dente */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Dente {selectedTooth} - Procedimentos
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Histórico do Dente */}
            {selectedToothRecords.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Histórico de Procedimentos</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedToothRecords
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map(record => (
                    <div
                      key={record.id}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{record.procedure}</span>
                          {getStatusIcon(record.status || 'planned')}
                          {getPriorityBadge(record.priority || 'medium')}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(record.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      {record.cost && (
                        <p className="text-sm text-gray-600 mb-2">
                          Custo: R$ {record.cost.toFixed(2)}
                        </p>
                      )}
                      
                      {record.observations && (
                        <p className="text-gray-600 text-sm mb-3">{record.observations}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Label className="text-xs">Status:</Label>
                          <Select
                            value={record.status}
                            onValueChange={(value) => handleUpdateRecord(record, value as ToothRecord['status'])}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center space-x-2">
                                    <span className={status.color}>{status.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {record.completed_at && (
                          <span className="text-xs text-green-600">
                            Concluído em: {new Date(record.completed_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar Novo Procedimento */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Adicionar Novo Procedimento</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="procedure">Procedimento *</Label>
                  <Select value={procedure} onValueChange={setProcedure}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um procedimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {procedures.map(proc => (
                        <SelectItem key={proc} value={proc}>
                          {proc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cost">Custo Estimado (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações sobre o procedimento..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseModal}>
                Fechar
              </Button>
              <Button onClick={handleAddRecord}>
                Adicionar Procedimento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToothChart;