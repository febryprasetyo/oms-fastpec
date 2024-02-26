"use client";

import { cn } from "@/utils/lib/utils";
import {
  AlignJustify,
  ChevronsLeft,
  LayoutGrid,
  TrainFront,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = {};

export default function Sidebar({}: Props) {
  const [isOpen, setisOpen] = useState<boolean>(false);

  return (
    <aside
      className={cn(
        `fixed min-h-screen bg-slate-800 flex flex-col px-5 py-7 z-10 space-y-10 items-center transition-all duration-300 ease-in-out`,
        isOpen ? `w-60` : `w-16`
      )}
    >
      <div className="w-full flex h-20 justify-between ">
        <Image
          src="/logo-fastpec.png"
          alt="Logo"
          width={100}
          height={50}
          className={`${!isOpen ? "hidden" : ""} w-[130px] object-contain`}
        />
        <button className="text-white" onClick={() => setisOpen(!isOpen)}>
          {isOpen ? <ChevronsLeft size={28} /> : <AlignJustify size={28} />}
        </button>
      </div>
      <nav className="w-full space-y-10">
        <div className="space-y-5">
          <Link href="/" className={cn(`text-white inline-block `)}>
            <div className="flex items-center gap-3 ">
              <LayoutGrid size={30} />
              {isOpen ? "Dashboard" : ""}
            </div>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
