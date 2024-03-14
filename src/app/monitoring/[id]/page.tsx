import ThemeToogle from "@/components/features/theme/ThemeToogle";
import Image from "next/image";
import Logo from "/public/logo.png";
import Link from "next/link";
import MonitoringSection from "@/components/section/MonitoringSection";

type Props = {
  params: {
    id: string;
  };
};

export default function page({ params: { id } }: Props) {
  return (
    <>
      <header className="flex w-full items-center justify-between bg-white px-5 py-3 shadow-sm dark:bg-darkSecondary sm:px-10">
        <Link href="/login">
          <Image src={Logo} alt="Fastpect Logo" className="w-32 dark:invert" />
        </Link>
        <ThemeToogle />
      </header>
      <main className={`px-5 py-5 transition-all sm:px-10`}>
        <MonitoringSection id={id} />
      </main>
    </>
  );
}
