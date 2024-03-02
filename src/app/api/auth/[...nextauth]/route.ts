import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth/next";

// Konfigurasi next-auth untuk login menggunakan username dan password
const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  // Secret untuk enkripsi cookie
  secret: process.env.NEXTAUTH_SECRET,
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
});
export { handler as GET, handler as POST };
