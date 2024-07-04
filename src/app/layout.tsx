import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { NextThemesProvider } from "@/services/providers/NextThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/services/providers/QueryProvider";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fastpect",
  description: "Fastpect is a fast and modern IOT Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} bg-slate-50 text-slate-700 dark:bg-dark dark:text-white`}
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </NextThemesProvider>
        <Toaster />
      </body>
    </html>
  );
}
