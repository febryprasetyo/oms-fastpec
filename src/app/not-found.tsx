import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {};

export default function notFound({}: Props) {
  return (
    <main className="h-screen w-full">
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <h1 className="font-base text-xl">404 - Halaman tidak ditemukan</h1>
        <Button className="bg-primary hover:bg-hover">
          <Link href="/">Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
