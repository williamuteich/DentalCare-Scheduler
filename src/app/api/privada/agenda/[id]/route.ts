import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();

    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    // checar conflitos caso data/time/duration mudem
    if (data.date || data.time || data.duration) {
      const current = await prisma.agenda.findUnique({ where: { id } });
      if (!current)
        return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });

      const newDate = data.date ?? current.date;
      const newTime = data.time ?? current.time;
      const newDuration = data.duration ?? current.duration ?? 60;
      const startTime = new Date(`${newDate}T${newTime}:00`).getTime();
      const endTime = startTime + newDuration * 60000;

      const sameDay = await prisma.agenda.findMany({ where: { date: newDate, NOT: { id } } });
      const conflict = sameDay.some((app) => {
        const s = new Date(`${app.date}T${app.time}:00`).getTime();
        const e = s + (app.duration ?? 60) * 60000;
        return s < endTime && e > startTime;
      });
      if (conflict) return NextResponse.json({ error: "Conflito de horário" }, { status: 400 });
    }

    const updated = await prisma.agenda.update({ where: { id }, data });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const appointment = await prisma.agenda.findUnique({ where: { id } });
    if (!appointment)
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });

    await prisma.agenda.delete({ where: { id } });
   
    return NextResponse.json({ sucess: "Agendamento excluído" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
