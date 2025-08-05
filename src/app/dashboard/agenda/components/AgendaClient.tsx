"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  isSameMonth, addMonths, addWeeks, isSameYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";

import { AgendaHeader } from "./AgendaHeader";
import { StatsCards } from "./StatsCards";
import { SearchBar } from "./SearchBar";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { AppointmentForm } from "./AppointmentForm";

type ViewMode = "day" | "week" | "month";

interface Client {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  title: string;
  completed?: boolean;
  clientId: string;
  clientName: string;
  value: number;
  note?: string;
  duration?: number;
}

const AgendaClient: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, revenue: 0 });
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/privada/clients", {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data: Client[] = await res.json();
        setClients(data);
      } else {
        throw new Error("Falha ao buscar clientes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar clientes");
    }
  }, []);

  const fetchAppointmentsForPeriod = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/privada/agenda?startDate=${startDate}&endDate=${endDate}`);
      
      if (res.ok) {
        const data: Appointment[] = await res.json();
        setAllAppointments(data);
        return data;
      } else {
        throw new Error("Falha ao buscar agendamentos");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar agendamentos");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAppointmentsForDay = useCallback(async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/privada/agenda?date=${dateStr}`);
      
      if (res.ok) {
        const data: Appointment[] = await res.json();
        setAppointments(data);
        
        const completed = data.filter(a => a.completed).length;
        const revenue = data.reduce((sum, appt) => sum + appt.value, 0);
        setStats({
          total: data.length,
          completed,
          revenue
        });
      } else {
        throw new Error("Falha ao buscar agendamentos");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, []);

  const headerText = useMemo(() => {
    if (viewMode === "day") {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      
      if (isSameMonth(start, end)) {
        return `${format(start, "d")} - ${format(end, "d 'de' MMMM", { locale: ptBR })}`;
      } else if (isSameYear(start, end)) {
        return `${format(start, "d 'de' MMM")} - ${format(end, "d 'de' MMM", { locale: ptBR })}`;
      } else {
        return `${format(start, "d 'de' MMM yyyy")} - ${format(end, "d 'de' MMM yyyy", { locale: ptBR })}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
  }, [viewMode, currentDate]);

  const filteredAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    
    const term = searchTerm.toLowerCase();
    return appointments.filter(appt => 
      appt.clientName.toLowerCase().includes(term) || 
      appt.title.toLowerCase().includes(term) ||
      (appt.note && appt.note.toLowerCase().includes(term)) ||
      appt.time.includes(term)
    );
  }, [appointments, searchTerm]);

  const navigate = useCallback((direction: number) => {
    if (viewMode === "day") {
      setCurrentDate(prev => addDays(prev, direction));
    } else if (viewMode === "week") {
      setCurrentDate(prev => addWeeks(prev, direction));
    } else if (viewMode === "month") {
      setCurrentDate(prev => addMonths(prev, direction));
    }
  }, [viewMode]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchClients();
        
        if (viewMode === "day") {
          await fetchAppointmentsForDay(format(currentDate, "yyyy-MM-dd"));
        } else {
          const start = viewMode === "week" 
            ? format(startOfWeek(currentDate), "yyyy-MM-dd")
            : format(startOfMonth(currentDate), "yyyy-MM-dd");
          
          const end = viewMode === "week" 
            ? format(endOfWeek(currentDate), "yyyy-MM-dd")
            : format(endOfMonth(currentDate), "yyyy-MM-dd");
          
          await fetchAppointmentsForPeriod(start, end);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    fetchInitialData();
  }, [viewMode, currentDate]);

  useEffect(() => {
    const updateView = async () => {
      if (viewMode === "day") {
        await fetchAppointmentsForDay(format(currentDate, "yyyy-MM-dd"));
      } else {
        const start = viewMode === "week" 
          ? format(startOfWeek(currentDate), "yyyy-MM-dd")
          : format(startOfMonth(currentDate), "yyyy-MM-dd");
        
        const end = viewMode === "week" 
          ? format(endOfWeek(currentDate), "yyyy-MM-dd")
          : format(endOfMonth(currentDate), "yyyy-MM-dd");
        
        await fetchAppointmentsForPeriod(start, end);
      }
    };

    updateView();
  }, [viewMode]);


  useEffect(() => {
    function atualizarAoEvento() {
      if (viewMode === "day") {
        fetchAppointmentsForDay(format(currentDate, "yyyy-MM-dd"));
      } else {
        const start = viewMode === "week" 
          ? format(startOfWeek(currentDate), "yyyy-MM-dd")
          : format(startOfMonth(currentDate), "yyyy-MM-dd");
        const end = viewMode === "week" 
          ? format(endOfWeek(currentDate), "yyyy-MM-dd")
          : format(endOfMonth(currentDate), "yyyy-MM-dd");
        fetchAppointmentsForPeriod(start, end);
      }
    }
    window.addEventListener('atualizar-agenda', atualizarAoEvento);
    return () => window.removeEventListener('atualizar-agenda', atualizarAoEvento);
  }, [viewMode, currentDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(editingAppointment ? "edit" : "create");
    
    const form = e.currentTarget;
    const fd = new FormData(form);
    
    const date = fd.get("date") as string;
    const time = fd.get("time") as string;
    const title = fd.get("title") as string;
    const clientId = fd.get("clientId") as string;
    const value = parseFloat(fd.get("value") as string);
    const note = fd.get("note") as string | null;
    const duration = parseInt(fd.get("duration") as string) || 60;
    
    const client = clients.find(c => c._id === clientId);
    if (!client) {
      toast.error("Cliente não encontrado");
      setProcessing(null);
      return;
    }
    
    const url = editingAppointment 
      ? `/api/privada/agenda/${editingAppointment._id}`
      : "/api/privada/agenda";
    
    const method = editingAppointment ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date, 
          time, 
          title, 
          clientId, 
          clientName: client.name, 
          value, 
          note,
          duration
        }),
      });
      
      if (res.ok) {
     
        if (viewMode === "day") {
          await fetchAppointmentsForDay(format(currentDate, "yyyy-MM-dd"));
        } else {
          const start = viewMode === "week" 
            ? format(startOfWeek(currentDate), "yyyy-MM-dd")
            : format(startOfMonth(currentDate), "yyyy-MM-dd");
          
          const end = viewMode === "week" 
            ? format(endOfWeek(currentDate), "yyyy-MM-dd")
            : format(endOfMonth(currentDate), "yyyy-MM-dd");
          
          await fetchAppointmentsForPeriod(start, end);
        }
        
        setOpenModal(false);
        setEditingAppointment(null);
        toast.success(editingAppointment ? "Agendamento atualizado!" : "Agendamento criado!");
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Erro ao salvar agendamento");
      }
    } catch (error) {
      toast.error("Erro de conexão");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {

    if (!id) {
      toast.error("ID do agendamento inválido");
      return;
    }
    setProcessing(`delete-${id}`);
    try {
      const res = await fetch(`/api/privada/agenda/delete`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success("Agendamento excluído!");
        // Atualizar a lista
        if (viewMode === "day") {
          await fetchAppointmentsForDay(format(currentDate, "yyyy-MM-dd"));
        } else {
          const start = viewMode === "week"
            ? format(startOfWeek(currentDate), "yyyy-MM-dd")
            : format(startOfMonth(currentDate), "yyyy-MM-dd");
          const end = viewMode === "week"
            ? format(endOfWeek(currentDate), "yyyy-MM-dd")
            : format(endOfMonth(currentDate), "yyyy-MM-dd");
          await fetchAppointmentsForPeriod(start, end);
        }
        setProcessing(null);
      } else {
        toast.error("Erro ao excluir agendamento");
        setProcessing(null);
      }
    } catch (error) {
      toast.error("Erro de conexão");
      setProcessing(null);
    }
  };

  const handleComplete = async (id: string) => {
    setProcessing(`complete-${id}`);
    
    try {
      const res = await fetch(`/api/privada/agenda/patch`, { 
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: true })
      });
      
      if (res.ok) {
        toast.success("Agendamento concluído!");
        
        if (viewMode === "day") {
          await fetchAppointmentsForDay(format(currentDate, "yyyy-MM-dd"));
        } else {
          const start = viewMode === "week" 
            ? format(startOfWeek(currentDate), "yyyy-MM-dd")
            : format(startOfMonth(currentDate), "yyyy-MM-dd");
          
          const end = viewMode === "week" 
            ? format(endOfWeek(currentDate), "yyyy-MM-dd")
            : format(endOfMonth(currentDate), "yyyy-MM-dd");
          
          await fetchAppointmentsForPeriod(start, end);
        }
      } else {
        toast.error("Erro ao concluir agendamento");
      }
    } catch (error) {
      toast.error("Erro de conexão");
    } finally {
      setProcessing(null);
    }
  };

  const openEditModal = (appt: Appointment) => {
    setEditingAppointment(appt);
    setOpenModal(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <AgendaHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onNavigate={navigate}
        onToday={() => setCurrentDate(new Date())}
        onViewChange={setViewMode}
        headerText={headerText}
      />
      
      {viewMode === "day" && (
        <StatsCards stats={stats} />
      )}
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewAppointment={() => {
          setEditingAppointment(null);
          setOpenModal(true);
        }}
      />
      
      {viewMode === "day" && (
        <DayView
          loading={loading}
          appointments={filteredAppointments}
          clients={clients}
          onComplete={handleComplete}
          onEdit={openEditModal}
          onDelete={handleDelete}
          processing={processing}
          searchTerm={searchTerm}
        />
      )}
      
      {viewMode === "week" && (
        <WeekView
          loading={loading}
          currentDate={currentDate}
          allAppointments={allAppointments}
          onDayClick={(day) => {
            setCurrentDate(day);
            setViewMode("day");
          }}
          onAppointmentClick={openEditModal}
        />
      )}
      
      {viewMode === "month" && (
        <MonthView
          loading={loading}
          currentDate={currentDate}
          allAppointments={allAppointments}
          onDayClick={(day) => {
            if (isSameMonth(day, currentDate)) {
              setCurrentDate(day);
              setViewMode("day");
            }
          }}
          onAppointmentClick={openEditModal}
        />
      )}
      
      <AppointmentForm
        open={openModal}
        onOpenChange={setOpenModal}
        editingAppointment={editingAppointment}
        clients={clients}
        currentDate={currentDate}
        allAppointments={allAppointments}
        onSubmit={handleSubmit}
        processing={processing}
      />
    </div>
  );
};

export default AgendaClient;