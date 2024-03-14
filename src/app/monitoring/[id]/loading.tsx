import MonitoringCardSkeleton from "@/components/features/skeleton/MonitoringCardSkeleton";
import ThemeToogle from "@/components/features/theme/ThemeToogle";
import Image from "next/image";
import Logo from "/public/logo.png";
import Link from "next/link";

export default function Loading() {
  return (
    <main className={`px-5 py-5 transition-all sm:px-10`}>
      <header className="flex w-full items-center justify-between bg-white px-5 py-3 shadow-sm dark:bg-darkSecondary sm:px-10">
        <Link href="/login">
          <Image src={Logo} alt="Fastpect Logo" className="w-32 dark:invert" />
        </Link>
        <ThemeToogle />
      </header>
      <section>
        <div className="grid grid-cols-1 gap-5 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
          {Array.from({ length: 13 }).map((_, index) => (
            <MonitoringCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
