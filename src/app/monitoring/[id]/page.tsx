import MonitoringCard from "@/components/features/card/MonitoringCard";
import ThemeToogle from "@/components/features/theme/ThemeToogle";
import Image from "next/image";
import Logo from "/public/logo.png";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};

export default function page({ params: { id } }: Props) {
  return (
    <>
      <header className="flex w-full items-center justify-between bg-white px-5 py-3 shadow-sm dark:bg-darkSecondary sm:px-10">
        <Link href="/">
          <Image src={Logo} alt="Fastpect Logo" className="w-32 dark:invert" />
        </Link>
        <ThemeToogle />
      </header>
      <main className={`px-5 py-5 transition-all sm:px-10`}>
        <section className="">
          <div className="3xl:grid-cols-6 grid grid-cols-1 gap-5 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
            <MonitoringCard
              title="Temperature"
              value="30  °C"
              date="27-02-2024"
              time="22:50:57"
            />
          </div>
        </section>
      </main>
    </>
  );
}
