type Props = {};

export default function loading({}: Props) {
  return (
    <main className="flex h-screen w-full items-center justify-center ">
      <h1 className="text-xl font-medium text-slate-700 dark:text-white">
        Redirecting...
      </h1>
    </main>
  );
}
