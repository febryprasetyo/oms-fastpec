"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function RootError({
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
    console.error("Root Route Error:", error);
    if (isChunkError) {
      const lastReload = sessionStorage.getItem("chunk_reload_attempt");
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem("chunk_reload_attempt", String(now));
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
        {isChunkError
          ? "Versi aplikasi baru telah diperbarui. Memuat ulang..."
          : `Terjadi kesalahan : ${error?.message || "Kesalahan tidak terduga"}`}
      </h2>
      <div className="flex items-center gap-3">
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
          <Button variant="outline">Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}
