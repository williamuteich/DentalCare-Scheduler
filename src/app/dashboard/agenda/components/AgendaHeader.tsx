'use client';

import { Button } from '@/components/ui/button';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { format, isToday } from 'date-fns';
import { AgendaHeaderProps } from '@/types/agenda';

export const AgendaHeader = ({
  currentDate,
  viewMode,
  onNavigate,
  onToday,
  onViewChange,
  headerText
}: AgendaHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Agenda de Atendimentos</h1>
        <div className="flex items-center gap-3 mt-2">
          <Button variant="outline" className='cursor-pointer hover:bg-neutral-200' size="icon" onClick={() => onNavigate(-1)}>
            <FiChevronLeft size={18} />
          </Button>
          
          <div className="text-center min-w-[200px]">
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {headerText}
            </p>
            {viewMode === 'day' && (
              <p className="text-sm text-gray-500">
                {format(currentDate, 'dd/MM/yyyy')}
              </p>
            )}
          </div>
          
          <Button variant="outline" className='cursor-pointer hover:bg-neutral-200' size="icon" onClick={() => onNavigate(1)}>
            <FiChevronRight size={18} />
          </Button>
          
          <Button
            onClick={onToday}
            variant={isToday(currentDate) ? 'default' : 'secondary'}
            className='cursor-pointer hover:bg-neutral-700'
          >
            Hoje
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onViewChange('day')}
          variant={viewMode === 'day' ? 'default' : 'secondary'}
          className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer hover:text-white"
        >
          <FiClock size={16} /> Dia
        </Button>
        
        <Button
          onClick={() => onViewChange('week')}
          variant={viewMode === 'week' ? 'default' : 'secondary'}
          className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer hover:text-white"
        >
          <FiClock size={16} /> Semana
        </Button>
        
        <Button
          onClick={() => onViewChange('month')}
          variant={viewMode === 'month' ? 'default' : 'secondary'}
          className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer hover:text-white"
        >
          <FiClock size={16} /> Mês
        </Button>
      </div>
    </div>
  );
};