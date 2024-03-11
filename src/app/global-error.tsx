"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html className="flex h-screen w-full items-center justify-center bg-white dark:bg-dark">
      <body className="space-y-5 text-center">
        <h2 className="text-2xl font-medium text-slate-700 dark:text-white">
          Terjadi kesalahan yang tidak terduga
        </h2>
        <Button
          className="bg-primary"
          onClick={() => {
            signOut({ callbackUrl: "/login" });
          }}
        >
          Kembali ke halaman login
        </Button>
      </body>
    </html>
  );
}
