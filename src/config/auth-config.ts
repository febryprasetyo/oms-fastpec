import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { axiosInstance } from "@/lib/axiosInstance";

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
          const res = await axiosInstance.post(`/api/auth/login`, {
            username: credentials?.username,
            password: credentials?.password,
          });
          const user = res.data;
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
