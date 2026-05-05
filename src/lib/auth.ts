import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const REMEMBER_ME_AGE = 30 * 24 * 60 * 60;
const DEFAULT_AGE = 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as never,
  session: { strategy: "jwt", maxAge: REMEMBER_ME_AGE },
  pages: { signIn: "/giris" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
        rememberMe: { label: "Beni Hatırla", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          rememberMe: credentials.rememberMe === "true",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.role = (user as unknown as { role: string }).role;
        token.rememberMe = (user as unknown as { rememberMe: boolean }).rememberMe;
        token.expiresAt = Date.now() + (token.rememberMe ? REMEMBER_ME_AGE : DEFAULT_AGE) * 1000;
      }

      // Session update from client (impersonation toggle)
      if (trigger === "update" && session && "impersonatingId" in session) {
        if (session.impersonatingId === null) {
          // Exit impersonation
          delete token.impersonatingId;
          delete token.impersonatedEmail;
          delete token.impersonatedRole;
        } else if (token.role === "ADMIN" && session.impersonatingId) {
          // Start impersonation — fetch target user once and cache in JWT
          const target = await prisma.user.findUnique({ where: { id: session.impersonatingId } });
          if (target && target.role !== "ADMIN") {
            token.impersonatingId = target.id;
            token.impersonatedEmail = target.email;
            token.impersonatedRole = target.role;
          }
        }
      }

      // Expiry check (skip for admin — admins don't expire)
      if (token.role !== "ADMIN" && token.expiresAt && Date.now() > (token.expiresAt as number)) {
        return {} as typeof token;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.id) return session;

      if (token.impersonatingId && token.impersonatedEmail && token.impersonatedRole) {
        // Admin is impersonating → surface target user but keep adminId reference
        session.user = {
          id: token.impersonatingId,
          email: token.impersonatedEmail,
          role: token.impersonatedRole,
          adminId: token.id,
          adminEmail: token.email,
        };
      } else {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email ?? session.user.email;
        session.user.adminId = undefined;
        session.user.adminEmail = undefined;
      }
      return session;
    },
  },
};
