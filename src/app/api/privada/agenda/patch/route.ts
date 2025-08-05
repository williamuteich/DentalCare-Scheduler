import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AppointmentUpdate {
  id: string;
  date?: string;
  time?: string;
  title?: string;
  clientId?: string;
  clientName?: string;
  value?: number;
  note?: string;
  duration?: number;
  completed?: boolean;
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as AppointmentUpdate;
    const { id, completed, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // fetch current appointment
    const current = await prisma.agenda.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    // If date/time/duration is being changed, make sure there is no conflict
    const newDate = data.date ?? current.date;
    const newTime = data.time ?? current.time;
    const newDuration = data.duration ?? current.duration ?? 60;

    const startTime = new Date(`${newDate}T${newTime}:00`);
    const endTime = new Date(startTime.getTime() + newDuration * 60000);

    const sameDay = await prisma.agenda.findMany({ where: { date: newDate, NOT: { id } } });

    const hasConflict = sameDay.some((app) => {
      const appStart = new Date(`${app.date}T${app.time}:00`).getTime();
      const appEnd = appStart + (app.duration ?? 60) * 60000;
      return appStart < endTime.getTime() && appEnd > startTime.getTime();
    });

    if (hasConflict) {
      return NextResponse.json({ error: "Conflito de horário" }, { status: 400 });
    }

    const updated = await prisma.agenda.update({
      where: { id },
      data: {
        ...data,
        completed: completed ?? current.completed,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
