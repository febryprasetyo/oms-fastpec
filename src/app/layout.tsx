import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { NextThemesProvider } from "@/services/providers/NextThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/services/providers/QueryProvider";
import NextTopLoader from "nextjs-toploader";
import { HydrationGuard } from "@/services/providers/HydrationGuard";

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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} bg-slate-100 text-slate-700`}>
        <NextTopLoader color="#3b82f6" showSpinner={false} zIndex={2000} />
        <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <HydrationGuard>
              {children}
            </HydrationGuard>
          </QueryProvider>
        </NextThemesProvider>
        <Toaster />
      </body>
    </html>
  );
}
