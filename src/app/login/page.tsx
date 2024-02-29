import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import FastpecLogo from "/public/logo.png";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <>
      <section className="px-10 sm:px-20 space-y-8 w-full py-10 lg:col-start-1 col-end-2">
        <div className="w-fit mx-auto px-3 py-2 rounded-xl mb-6">
          <Image
            src={FastpecLogo}
            alt="Fastpect logo"
            className="w-[150px] sm:w-[180px] dark:invert"
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
        <form className="mt-5 space-y-6 w-full sm:max-w-lg mx-auto">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="username">Username :</Label>
            <Input type="text" id="username" placeholder="Username" />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password :</Label>
            <Input type="password" id="password" placeholder="Password" />
          </div>
          <Button className="w-full bg-primary hover:bg-hover">Login</Button>
        </form>
      </section>
      <section className="hidden w-full lg:flex bg-slate-500 h-screen lg:col-start-2 lg:col-end-3 bg-login"></section>
    </>
  );
}
