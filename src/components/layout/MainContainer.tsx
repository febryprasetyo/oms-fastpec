"use client";
import { useExpandedStore } from "@/services/store";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function MainContainer({ children }: Props) {
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  // Route yang akan di render main container
  const renderRoute = ["/", "/stasiun", "/user", "/mesin", "/database"];
  const pathname = usePathname();
  // Jika route ada di dalam array, maka render main container
  if (renderRoute.includes(pathname)) {
    // Jika sidebar di expanded, maka tambahkan padding left
    return (
      <main
        className={`px-5 py-5 transition-all sm:px-10 ${
          isExpanded ? "pl-20 sm:pl-24" : ""
        }`}
      >
        {/* Tujuannya Adalah agar Children bisa menggunakan server components */}
        {children}
      </main>
    );
  }
  return <>{children}</>;
}
