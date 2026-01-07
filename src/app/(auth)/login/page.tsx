import Image from "next/image";
import FastpecLogo from "@/assets/img/logo.png";
import LoginBg from "@/assets/img/login-bg.png";
import LoginForm from "@/components/features/form/LoginForm";

export default function Login() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-dark dark:text-white">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Side: Login Form */}
        <section className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
          <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-8 block">
                <Image
                  src={FastpecLogo}
                  alt="Fastpec logo"
                  className="w-40 dark:invert sm:w-48"
                  priority
                />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Selamat Datang
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Silahkan login untuk mengakses Online Monitoring System Fastpec.
              </p>
            </div>
            
            <div className="rounded-2xl bg-white p-2 shadow-xl shadow-slate-200/50 dark:bg-darkSecondary dark:shadow-none lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="p-6 lg:p-0">
                <LoginForm />
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 lg:text-left">
              &copy; {new Date().getFullYear()} Fastpec OMS. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </section>

        {/* Right Side: Decorative Background */}
        <section className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:block">
          <Image
            src={LoginBg}
            alt="Water Analytics Background"
            fill
            className="object-cover opacity-60 transition-transform duration-10000 hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="text-4xl font-black tracking-tight">
              Monitoring Kualitas Air <br />
              <span className="text-blue-400">Secara Real-time</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-slate-300">
              Solusi cerdas untuk pemantauan parameter sensor lingkungan yang akurat dan terpercaya.
            </p>
            <div className="mt-8 flex gap-2">
              <div className="h-1 w-12 rounded-full bg-blue-500" />
              <div className="h-1 w-4 rounded-full bg-slate-700" />
              <div className="h-1 w-4 rounded-full bg-slate-700" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
