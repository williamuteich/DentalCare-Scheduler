import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    try {
      const result = await prisma.users.update({
        where: { id },
        data,
        select: {
          id: true,
        },
      });

      return NextResponse.json({ sucess: "Dados Alterados Com Sucesso" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }
      throw error;
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
