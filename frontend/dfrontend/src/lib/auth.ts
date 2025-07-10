import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare } from "bcrypt";
import { use } from "react";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) return null;

        const passwordMatch = await compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatch) return null;

        return {
          id: `${existingUser.id}`,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback:", { user, token });

      if (user) {
        // User object is available during sign-in
        token.id = user.id;
        token.role = user.role;
      } else if (token.email && !token.role) {
        // Fetch user data if we don't have role (for subsequent requests)
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      console.log("JWT token after:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      console.log("Session after:", session);
      return session;
    },
    async signIn({ user }) {
      await prisma.user.update({
        where: { email: user.email! },
        data: { lastLogin: new Date(), isActive: true },
      });
      return true;
    },
  },
};
