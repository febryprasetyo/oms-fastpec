"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === "ChunkLoadError" ||
    error?.message?.includes("Loading chunk") ||
    error?.message?.includes("Failed to fetch dynamically imported module");

  useEffect(() => {
    console.error("Global Error:", error);
    if (isChunkError) {
      const lastReload = sessionStorage.getItem("chunk_reload_attempt");
      const now = Date.now();
      // Auto-reload once if a new build deployed new chunk hashes
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem("chunk_reload_attempt", String(now));
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  return (
    <html className="flex h-screen w-full items-center justify-center bg-white dark:bg-dark">
      <body className="space-y-5 text-center p-6">
        <h2 className="text-xl font-medium text-slate-700 dark:text-white">
          {isChunkError
            ? "Versi aplikasi baru telah diperbarui. Memuat ulang..."
            : `Terjadi kesalahan yang tidak terduga : ${error?.message || "Kesalahan sistem"}`}
        </h2>
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            className="bg-primary text-white"
            onClick={() => {
              if (isChunkError) {
                window.location.reload();
              } else {
                reset();
              }
            }}
          >
            {isChunkError ? "Muat Ulang Halaman" : "Coba Lagi"}
          </Button>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </body>
    </html>
  );
}
