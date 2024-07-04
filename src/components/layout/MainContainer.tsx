"use client";
import { useAuthStoreCSR, useExpandedStore } from "@/services/store";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function MainContainer({ children }: Props) {
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const pathname = usePathname();
  const user = useAuthStoreCSR();
  const router = useRouter();

  useEffect(() => {
    if (!user == null) {
      router.push("/login");
    }
  }, [user, router]);

  if (user == undefined) {
    return (
      <main
        className={`flex h-screen w-full items-center justify-center px-5 py-5 transition-all sm:px-10 ${
          isExpanded ? "pl-20 sm:pl-24" : ""
        }`}
      >
        <div
          className="text-surface inline-block size-10 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </main>
    );
  }

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
