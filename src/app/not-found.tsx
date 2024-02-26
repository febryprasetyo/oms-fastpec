import { Button } from "@/components/ui/button";

type Props = {};

export default function notFound({}: Props) {
  return (
    <main className="h-screen w-full">
      <div className="flex justify-center items-center h-full flex-col gap-5">
        <h1 className="text-xl font-base">404 - Halaman tidak ditemukan</h1>
        <Button className="bg-primary">Kembali ke Dashboard</Button>
      </div>
    </main>
  );
}
