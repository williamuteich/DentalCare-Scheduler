import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email e Senha São Requiridas.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                password: true,
                active: true
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'Usuário Não Encontrado.' }, { status: 404 });
        }

        if (!user.password) {
            return NextResponse.json({ message: "Senha não cadastrada." }, { status: 400 });
        }

        const matchPassword = await bcrypt.compare(password, user.password);


        if (!matchPassword) {
            return NextResponse.json({ message: 'Senha inválida.' }, { status: 401 });
        }

        if (user.active === false) {
            return NextResponse.json({ message: "Necessária Validação de Email.", active: user.active }, { status: 401 });
        }


        const token = `${user.id}-${user.email}-${Date.now()}`;


        (await

            cookies()).set('auth_token', token, {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                secure: true
            });

        return NextResponse.json({
            message: 'Usuário Autenticado Com Sucesso.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            }
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
