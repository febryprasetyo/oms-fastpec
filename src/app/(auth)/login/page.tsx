import Image from "next/image";
import FastpecLogo from "@/assets/img/logo.png";
import LoginForm from "@/components/features/form/LoginForm";

type Props = {
  searchParams: Record<"callbackUrl", string>;
};
export default function Login({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-white dark:bg-dark dark:text-white lg:grid lg:grid-cols-2">
      <section className="col-end-2 w-full space-y-8 px-10 py-10 sm:px-20 lg:col-start-1">
        <div className="mx-auto mb-6 w-fit rounded-xl px-3 py-2">
          <Image
            src={FastpecLogo}
            alt="Fastpect logo"
            className="w-[150px] dark:invert sm:w-[200px]"
          />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold text-slate-800 dark:text-white">
            Selamat datang di Fastpec
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Silahkan login untuk melanjutkan
          </p>
        </div>
        <LoginForm callBackUrl={searchParams?.callbackUrl} />
      </section>
      <section className="bg-login hidden h-screen w-full bg-slate-500 lg:col-start-2 lg:col-end-3 lg:flex"></section>
    </main>
  );
}
