import { config } from "@/config/auth-config";
import NextAuth from "next-auth/next";
// Konfigurasi next-auth untuk login menggunakan username dan password
const handler = NextAuth(config);
export { handler as GET, handler as POST };
