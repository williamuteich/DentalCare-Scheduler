'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { AppointmentFormProps } from '@/types/agenda';

function SelectPaciente({ clients, value, onChange }: { clients: any[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select
      id="clientId"
      name="clientId"
      value={value}
      onChange={onChange}
      required
      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Paciente"
    >
      <option value="">Selecione um paciente</option>
      {clients.map((client: any, idx: number) => (
        <option key={client._id || client.id || idx} value={String(client._id || client.id)}>{client.name}</option>
      ))}
    </select>
  );
}


export const AppointmentForm = ({
  open,
  onOpenChange,
  clients,
  currentDate,
  editingAppointment,
}: AppointmentFormProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(format(currentDate || new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState<string>("09:00");
  const [value, setValue] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [duration, setDuration] = useState<string>("60");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingAppointment) {
      const clientId = editingAppointment.clientId ||
        (editingAppointment.client && (editingAppointment.client._id || editingAppointment.client.id)) ||
        "";

      let finalClientId = clientId;
      if (!clientId && editingAppointment.clientName) {
        const foundClient = clients.find(c => c.name === editingAppointment.clientName);
        if (foundClient) {
          finalClientId = foundClient._id || foundClient.id;
        }
      }

      setSelectedClientId(finalClientId);
      setTitle(editingAppointment.title || "");
      setDate(editingAppointment.date || format(currentDate || new Date(), 'yyyy-MM-dd'));
      setTime(editingAppointment.time || "09:00");
      setValue(editingAppointment.value !== undefined ? String(editingAppointment.value) : "");
      setNote(editingAppointment.note || editingAppointment.notes || "");
      setDuration(editingAppointment.duration !== undefined ? String(editingAppointment.duration) : "60");
    } else {
      setSelectedClientId("");
      setTitle("");
      setDate(format(currentDate || new Date(), 'yyyy-MM-dd'));
      setTime("09:00");
      setValue("");
      setNote("");
      setDuration("60");
    }
  }, [editingAppointment, currentDate, clients]);


  async function atualizarAgenda() {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('atualizar-agenda'));
    }
  }

  const handleLocalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClientId || !title) return;
    const client = clients.find((c: any) => String(c._id || c.id) === String(selectedClientId));
    if (!client) {
      alert('Selecione um paciente válido!');
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (editingAppointment && (editingAppointment.id || editingAppointment._id)) {
        const patchPayload: any = {
          id: editingAppointment.id || editingAppointment._id
        };
        if (selectedClientId !== editingAppointment.clientId) patchPayload.clientId = client._id || client.id;
        if (client.name !== editingAppointment.clientName) patchPayload.clientName = client.name;
        if (title !== editingAppointment.title) patchPayload.title = title;
        if (date !== editingAppointment.date) patchPayload.date = date;
        if (time !== editingAppointment.time) patchPayload.time = time;
        if (value !== String(editingAppointment.value)) patchPayload.value = value ? parseFloat(value) : 0;
        if (note !== (editingAppointment.note || editingAppointment.notes || "")) patchPayload.note = note;
        if (duration !== String(editingAppointment.duration)) patchPayload.duration = duration ? parseInt(duration) : 60;
        res = await fetch(`/api/privada/agenda/patch`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchPayload)
        });
      } else {
        const payload = {
          clientId: client._id || client.id,
          clientName: client.name,
          title,
          date,
          time,
          value: value ? parseFloat(value) : 0,
          note,
          duration: duration ? parseInt(duration) : 60
        };
        res = await fetch('/api/privada/agenda/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (res && res.ok) {
        setSelectedClientId("");
        setTitle("");
        setDate(format(currentDate || new Date(), 'yyyy-MM-dd'));
        setTime("09:00");
        setValue("");
        setNote("");
        setDuration("60");
        onOpenChange(false);
        await atualizarAgenda();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="appointment-form-description">
        <DialogHeader>
          <DialogTitle>{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
        </DialogHeader>
        <div id="appointment-form-description" className="sr-only">
          {editingAppointment ? 'Edite os campos do agendamento existente' : 'Preencha todos os campos obrigatórios para criar um novo agendamento'}
        </div>
        <form onSubmit={handleLocalSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Paciente</Label>
            <SelectPaciente clients={clients} value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Procedimento</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Limpeza, Consulta, Tratamento de canal..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <select
                id="duration"
                name="duration"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 min</option>
                <option value="60">1 hora</option>
                <option value="90">1h 30min</option>
                <option value="120">2 horas</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Observações</Label>
            <Textarea
              id="note"
              name="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedClientId || !title || submitting}>
              {submitting ? (editingAppointment ? 'Salvando...' : 'Agendando...') : (editingAppointment ? 'Salvar' : 'Agendar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};