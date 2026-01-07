"use client";
import { useAuthStore, useExpandedStore } from "@/services/store";
import { deleteCookie } from "cookies-next";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { setDefaultOptions } from "date-fns";
import { id } from "date-fns/locale";

type Props = {
  children: React.ReactNode;
};

export default function MainContainer({ children }: Props) {
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  setDefaultOptions({ locale: id });

  useEffect(() => {
    if (user === null) {
      deleteCookie("token");
      router.push("/login");
    }
  }, [user, router]);

  if (pathname.includes("/monitoring")) {
    return children;
  }

  return (
    <main
      className={`px-5 py-5 transition-all sm:px-10 ${
        isExpanded ? "sm:pl-72" : ""
      }`}
    >
      {children}
    </main>
  );
}
