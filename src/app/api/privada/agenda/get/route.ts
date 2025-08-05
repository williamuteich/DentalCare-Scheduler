import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (date) {
      where.date = date;
    } else if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate } as any;
    }

    const list = await prisma.agenda.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
