import Image from "next/image";
import FastpecLogo from "/public/logo.png";
import LoginForm from "@/components/features/form/LoginForm";

type Props = {
  searchParams: Record<"error" | "callbackUrl", string>;
};
export default function Login({ searchParams }: Props) {
  return (
    <>
      <section className="px-10 sm:px-20 space-y-8 w-full py-10 lg:col-start-1 col-end-2">
        <div className="w-fit mx-auto px-3 py-2 rounded-xl mb-6">
          <Image
            src={FastpecLogo}
            alt="Fastpect logo"
            className="w-[150px] sm:w-[200px] dark:invert"
          />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-slate-800 text-4xl font-semibold dark:text-white">
            Selamat datang di Fastpec
          </h1>
          <p className="text-slate-600 text-base dark:text-slate-400">
            Silahkan login untuk melanjutkan
          </p>
        </div>
        <LoginForm
          callBackUrl={searchParams?.callbackUrl}
          error={searchParams?.error}
        />
      </section>
      <section className="hidden w-full lg:flex bg-slate-500 h-screen lg:col-start-2 lg:col-end-3 bg-login"></section>
    </>
  );
}
