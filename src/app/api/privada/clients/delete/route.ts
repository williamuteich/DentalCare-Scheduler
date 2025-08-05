import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Hard delete
    await prisma.clients.delete({ where: { id } });

    return NextResponse.json({ sucess: "Cliente excluído" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
