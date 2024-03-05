import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Config untuk next-auth
export const config = {
  // Provider untuk login menggunakan username dan password
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Fungsi untuk authorize user
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });
          const user = await res.json();
          if (user.success) {
            return user;
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3400, // Expired dalam 1 jam
  },
  jwt: {
    maxAge: 3400, // Expired dalam 1 jam
  },
  // Secret untuk enkripsi cookie
  secret: process.env.NEXTAUTH_SECRET,
  // Fungsi yang dijalankan ketika user berhasil login
  callbacks: {
    // Fungsi untuk mengambil data user dari token
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    // Fungsi untuk membuat session
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}
