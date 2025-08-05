import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Required fields validation
    if (!data?.email || !data?.name) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Default values
    data.active = true;

    // Converte birthDate string (yyyy-mm-dd) para Date
    if (data.birthDate) {
      try {
        data.birthDate = new Date(data.birthDate);
        if (isNaN(data.birthDate.getTime())) delete data.birthDate;
      } catch {
        delete data.birthDate;
      }
    }

    // Converte strings "true"/"false" de active se vierem
    if (typeof data.active === "string") {
      data.active = data.active === "true";
    }

    // Unique email check
    const existing = await prisma.clients.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const created = await prisma.clients.create({
      data,
      select: { id: true },
    });

    return NextResponse.json({ sucess: "cliente criado com sucesso", id: created.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
