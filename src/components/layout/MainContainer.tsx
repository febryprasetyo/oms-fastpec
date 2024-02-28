"use client";
import { useExpandedStore } from "@/services/store";

type Props = {
  children: React.ReactNode;
};

export default function MainContainer({ children }: Props) {
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
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
