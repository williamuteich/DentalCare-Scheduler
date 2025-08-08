'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchBarProps } from '@/types/agenda';
import { FiPlus, FiUser } from 'react-icons/fi';

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onNewAppointment
}: SearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por paciente, procedimento ou horário..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Button onClick={onNewAppointment} className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer hover:text-white">
        <FiPlus size={18} />
        Novo Agendamento
      </Button>
    </div>
  );
};