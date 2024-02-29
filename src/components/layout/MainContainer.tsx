"use client";
import { useExpandedStore } from "@/services/store";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function MainContainer({ children }: Props) {
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const unRenderPathname = ["/login"];
  const pathname = usePathname();

  if (!unRenderPathname.includes(pathname)) {
    return (
      <main
        className={`py-5 px-5 sm:px-10 transition-all ${
          isExpanded ? "pl-20 sm:pl-24" : ""
        }`}
      >
        {children}
      </main>
    );
  }
  return (
    <main className="min-h-screen w-full overflow-x-hidden lg:grid lg:grid-cols-2 flex justify-center items-center bg-white dark:bg-dark dark:text-white">
      {children}
    </main>
  );
}
