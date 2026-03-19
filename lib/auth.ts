import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

const splitEmails = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const adminEmails = new Set([
  ...splitEmails(process.env.ADMIN_EMAILS),
  ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.toLowerCase()] : [])
]);

const isAdminEmail = (email: string) => adminEmails.has(email.toLowerCase());

async function isValidAdminPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return compare(password, hash);
  }

  const plain = process.env.ADMIN_PASSWORD;
  return Boolean(plain && password === plain);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password || !isAdminEmail(email)) {
          return null;
        }

        const validPassword = await isValidAdminPassword(password);
        if (!validPassword) {
          return null;
        }

        return {
          id: email,
          email,
          name: email,
          role: "admin"
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    }
  }
};

export const isAdmin = (role?: string | null) => role === "admin";
