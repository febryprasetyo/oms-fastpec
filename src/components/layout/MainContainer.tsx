"use client";
import { useAuthStore, useExpandedStore } from "@/services/store";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function MainContainer({ children }: Props) {
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  console.log(user);

  useEffect(() => {
    if (user === null) {
      console.log("redirect");
      router.push("/login");
      router.refresh();
    }
  }, [user, router]);

  if (pathname.includes("/monitoring")) {
    return children;
  }

  return (
    <main
      className={`px-5 py-5 transition-all sm:px-10 ${
        isExpanded ? "pl-20 sm:pl-24" : ""
      }`}
    >
      {children}
    </main>
  );
}
