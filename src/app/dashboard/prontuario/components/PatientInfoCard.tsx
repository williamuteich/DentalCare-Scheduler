import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Client } from '@/types/client';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Calendar, MapPin, FileText, 
  HeartPulse, ClipboardList, VenetianMask
} from 'lucide-react';

interface PatientInfoCardProps {
  client: Client;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ client }) => {
  // Funções de formatação
  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Não informado';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Não informada';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Componente auxiliar para campos
  const InfoField = ({ 
    icon: Icon, 
    label, 
    value,
    valueIfEmpty = 'Não informado'
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: React.ReactNode;
    valueIfEmpty?: string;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="font-medium text-gray-900">
          {value || valueIfEmpty}
        </p>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <VenetianMask className="h-6 w-6 text-blue-600" />
            <span>Dados do Paciente</span>
          </CardTitle>
          <Badge 
            variant={client.active ? 'default' : 'destructive'}
            className="px-3 py-1 rounded-full text-sm"
          >
            {client.active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 border-r">
            <div className="space-y-1">
              <InfoField icon={User} label="Nome Completo" value={client.name} />
              <InfoField icon={Mail} label="Email" value={client.email} />
              <InfoField 
                icon={Phone} 
                label="Telefone" 
                value={formatPhone(client.phone)} 
              />
              <InfoField icon={User} label="CPF" value={client.cpf} />
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-1">
              <InfoField 
                icon={Calendar} 
                label="Data de Nascimento" 
                value={formatDate(client.birthDate)} 
              />
              <InfoField 
                icon={MapPin} 
                label="Endereço" 
                value={client.address} 
              />
              <InfoField 
                icon={ClipboardList} 
                label="Histórico" 
                value={client.historico} 
              />
              <InfoField 
                icon={HeartPulse} 
                label="Alergias" 
                value={client.allergies}
                valueIfEmpty="Nenhuma registrada"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Histórico Médico</h3>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-gray-700">
              {client.medicalHistory || 'Nenhum histórico médico registrado.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;