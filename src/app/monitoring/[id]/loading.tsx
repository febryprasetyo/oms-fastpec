import MonitoringCardSkeleton from "@/components/features/skeleton/MonitoringCardSkeleton";
import Image from "next/image";
import Logo from "@/assets/img/logo.png";
import Link from "next/link";

export default function Loading() {
  return (
    <>
      <header className="grid w-full grid-cols-3 place-items-end bg-white px-5 py-3 shadow-sm dark:bg-darkSecondary sm:px-10">
        <nav className="place-self-start">
          <Link href="/login">
            <Image
              src={Logo}
              alt="Fastpect Logo"
              className="w-32 dark:invert"
            />
          </Link>
        </nav>
        <h1 className="place-self-center text-xl font-medium text-slate-700 dark:text-white">
          Online Monitoring System
        </h1>
        <div className="flex items-center gap-5">
          <p>Loading...</p>
        </div>
      </header>
      <main className={`p-5 transition-all sm:px-10`}>
        <section>
          <div className="grid grid-cols-1 gap-5 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
            {Array.from({ length: 13 }).map((_, index) => (
              <MonitoringCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
