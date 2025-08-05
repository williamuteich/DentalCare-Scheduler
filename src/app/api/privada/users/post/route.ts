import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data?.email || !data?.password) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    if (!data.name) {
      data.name = data.email.split("@")[0];
    }

    const existing = await prisma.users.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(data.password, 10);

    await prisma.users.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashed,
        role: data.role ?? "staff",
        active: true,
      },
      select: { id: true },
    });

    return NextResponse.json({ sucess: "usuário criando com sucesso" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
