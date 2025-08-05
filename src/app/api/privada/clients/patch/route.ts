import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Se email for alterado, garantir unicidade
    if (data.email) {
      const existing = await prisma.clients.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
      }
    }

    // Converte birthDate se vier como string
    if (typeof data.birthDate === "string") {
      try {
        const d = new Date(data.birthDate);
        if (!isNaN(d.getTime())) data.birthDate = d;
        else delete data.birthDate;
      } catch {
        delete data.birthDate;
      }
    }

    if (typeof data.active === "string") {
      data.active = data.active === "true";
    }

    // Atualiza
    const result = await prisma.clients.update({
      where: { id },
      data,
      select: { id: true },
    });

    return NextResponse.json({ sucess: "Dados alterados com sucesso" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
