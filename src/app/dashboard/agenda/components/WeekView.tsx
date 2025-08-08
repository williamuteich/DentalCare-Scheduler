'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiClock } from 'react-icons/fi';
import { useMemo } from 'react';
import Link from 'next/link';
import { WeekViewProps } from '@/types/agenda';

export const WeekView = ({
  loading,
  currentDate,
  allAppointments,
  onAppointmentClick
}: WeekViewProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const formatShortDate = (date: Date) => {
    return format(date, "dd/MM", { locale: ptBR });
  };

  const formatWeekday = (date: Date) => {
    return format(date, "EEE", { locale: ptBR });
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return allAppointments.filter(appt => appt.date === dateStr);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-8 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : allAppointments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="inline-block bg-blue-50 p-4 rounded-full mb-4">
              <FiClock className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum agendamento para esta semana
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Você não possui agendamentos marcados para esta semana.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[800px]">
              {weekDays.map((day) => (
                <div 
                  key={day.toISOString()} 
                  className={`p-3 text-center ${isToday(day) ? "bg-blue-50" : ""}`}
                >
                  <div className="font-semibold text-gray-800 capitalize">
                    {formatWeekday(day)}
                  </div>
                  <div className={`text-sm ${isToday(day) ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                    {formatShortDate(day)}
                  </div>
                </div>
              ))}
              
              {weekDays.map((day) => (
                <div 
                  key={`appts-${day.toISOString()}`} 
                  className="border-t p-2 min-h-[150px]"
                >
                  {getAppointmentsForDay(day).map(appt => (
                    <div 
                      key={appt._id || appt.id || `${appt.date}-${appt.time}`}
                      className="mb-2 p-2 bg-blue-50 rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors flex flex-col gap-1"
                      onClick={() => onAppointmentClick(appt)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{appt.time}</div>
                          <div className="text-xs font-semibold truncate">{appt.clientName}</div>
                          <div className="text-xs text-gray-600 truncate">{appt.title}</div>
                        </div>
                      </div>
                      {appt.completed && (
                        <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full mt-2 inline-block">
                          Concluído
                        </span>
                      )}
                      <Link
                        href={`/prontuario/${appt.clientId}`}
                        onClick={e => e.stopPropagation()}
                        className="mt-1 inline-block text-blue-600 hover:underline font-medium"
                      >
                        Ver Prontuário
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};