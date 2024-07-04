import ThemeToogle from "@/components/features/theme/ThemeToogle";
import Image from "next/image";
import Logo from "@/assets/img/logo.png";
import Link from "next/link";
import MonitoringSection from "@/components/section/MonitoringSection";
import { getStationList } from "@/services/api/station";
import { getCookie } from "cookies-next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type Props = {
  params: {
    id: string;
  };
};

export default async function page({ params: { id } }: Props) {
  const cookie = getCookie("token", { cookies });
  if (!cookie) {
    redirect("/login");
  }
  const station = await getStationList(cookie);

  return (
    <>
      <header className="grid w-full grid-cols-2 place-items-end bg-white px-5 py-3 shadow-sm dark:bg-darkSecondary sm:px-10 lg:grid-cols-3">
        <nav className="place-self-start">
          <Link href="/login">
            <Image
              src={Logo}
              alt="Fastpect Logo"
              className="w-32 dark:invert"
            />
          </Link>
        </nav>
        <h1 className="hidden place-self-center text-xl font-medium text-slate-700 dark:text-white lg:block">
          Online Monitoring System
        </h1>
        <div className="flex items-center gap-5">
          <p className="hidden text-slate-700 sm:block">
            { station?.success
              ? station.data.values.filter((item) => item.id_mesin === id)[0]
                  .nama_stasiun
              : id}
          </p>
          <ThemeToogle />
        </div>
      </header>
      <main className={`px-5 py-5 transition-all sm:px-10`}>
        <MonitoringSection id={id} />
      </main>
    </>
  );
}
