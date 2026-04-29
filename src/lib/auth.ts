import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const REMEMBER_ME_AGE = 30 * 24 * 60 * 60; // 30 gün
const DEFAULT_AGE = 24 * 60 * 60;           // 1 gün

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as never,
  // maxAge burada en uzun değer — gerçek süre jwt callback'te token.exp ile kontrol edilir
  session: { strategy: "jwt", maxAge: REMEMBER_ME_AGE },
  pages: {
    signIn: "/giris",
  },
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

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
    async jwt({ token, user }) {
      if (user) {
        // İlk giriş: token oluşturulurken süreyi ve rememberMe'yi kaydet
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.rememberMe = (user as unknown as { rememberMe: boolean }).rememberMe;
        token.expiresAt = Date.now() + (token.rememberMe ? REMEMBER_ME_AGE : DEFAULT_AGE) * 1000;
      }

      // Her istekte: manuel süre kontrolü — NextAuth sliding session'ı engelle
      if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
        return {} as typeof token; // boş token → session geçersiz → login sayfasına
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
