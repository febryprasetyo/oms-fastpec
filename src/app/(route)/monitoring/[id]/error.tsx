"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-screen w-full items-center justify-center bg-white dark:bg-dark">
      <section className="space-y-5 text-center">
        <h2 className="text-2xl font-medium text-slate-700 dark:text-white">
          Terjadi kesalahan yang tidak terduga : {error.message}
        </h2>
        <div className="flex w-full items-center justify-center gap-5">
          <Link href={"/"}>
            <Button className="bg-primary">Home</Button>
          </Link>
          <Button
            className="bg-primary"
            onClick={() => {
              reset();
            }}
          >
            Reset
          </Button>
        </div>
      </section>
    </main>
  );
}
