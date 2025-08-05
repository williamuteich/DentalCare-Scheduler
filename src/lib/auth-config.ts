import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const auth: NextAuthOptions = {
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email", placeholder: "Seu E-mail" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-mail e senha são obrigatórios.');
        }
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
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
          throw new Error('Usuário não encontrado.');
        }

        if (!user.active) {
          throw new Error('Necessária validação de e-mail.');
        }
        
        const matchPassword = await bcrypt.compare(credentials.password, user.password);
        if (!matchPassword) {
          throw new Error('Senha inválida.');
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        } as User;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 86400,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userID = user.id;
        token.role = user.role;
        token.active = user.active;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role) {
        session.user.userID = token.userID;
        session.user.role = token.role;
        session.user.active = token.active;
      }
      return session;
    },
  },
};