import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clients = await prisma.clients.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        birthDate: true,
        address: true,
        medicalHistory: true,
        allergies: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(clients);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
