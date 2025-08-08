import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AppointmentRequest {
  date: string;
  time: string;
  title: string;
  clientId: string;
  clientName: string;
  value: number;
  note?: string;
  duration?: number; // in minutes
  professionalId?: string;
  professionalName?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AppointmentRequest;
    const {
      date,
      time,
      title,
      clientId,
      clientName,
      value,
      note = "",
      duration = 60,
      professionalId = undefined,
      professionalName = undefined,
    } = body;

    if (!date || !time || !title || !clientId || !clientName || value == null) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // basic hour validation
    const [h] = time.split(":");
    const hour = parseInt(h, 10);
    if (hour < 7 || hour > 22) {
      return NextResponse.json({ error: "Horário inválido" }, { status: 400 });
    }

    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Fetch possible conflicting appointments on same date
    const sameDay = await prisma.agenda.findMany({ where: { date } });

    const hasConflict = sameDay.some((app) => {
      const appStart = new Date(`${app.date}T${app.time}:00`).getTime();
      const appEnd = appStart + (app.duration ?? 60) * 60000;
      return appStart < endTime.getTime() && appEnd > startTime.getTime();
    });

    if (hasConflict) {
      return NextResponse.json({ error: "Conflito de horário" }, { status: 400 });
    }

    const agendaData: any = {
      date,
      time,
      title,
      clientId,
      clientName,
      value,
      note,
      duration,
      completed: false,
      professionalName,
    };
    if (professionalId && professionalId !== "") {
      agendaData.professionalId = professionalId;
    }
    const newAppointment = await prisma.agenda.create({
      data: agendaData,
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
