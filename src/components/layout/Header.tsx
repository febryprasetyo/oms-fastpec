"use client";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import ThemeToogle from "../features/theme/ThemeToogle";
import { useExpandedStore } from "@/services/store";
import { Button } from "../ui/button";
import { ChevronsRightIcon } from "lucide-react";

type Props = {};

export default function Header({}: Props) {
  const pathname = usePathname();
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const setExpanded = useExpandedStore((state: Expanded) => state.setExpanded);
  const unprotectedPath = ["/login"];

  if (!unprotectedPath.includes(pathname)) {
    return (
      <header
        className={`w-full transition-none py-5 px-5 sm:px-10 flex justify-between items-center ${
          isExpanded ? "pl-20 sm:pl-24" : ""
        }`}
      >
        <div className="flex gap-5 items-center">
          {!isExpanded ? (
            <Button
              className="transition-all text-slate-700 bg-transparent hover:bg-slate-100 hover:text-slate-700 dark:text-white dark:hover:bg-dark_accent"
              size="icon"
              onClick={() => {
                setExpanded(true);
              }}
            >
              <ChevronsRightIcon size={25} />
            </Button>
          ) : null}
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>Ad</AvatarFallback>
          </Avatar>
          <div className="">
            <p className="text-slate-600 dark:text-slate-300">
              Selamat datang ,
            </p>
            <strong className="text-lg font-semibold text-slate-800 dark:text-white">
              Admin
            </strong>
          </div>
        </div>
        <div className="flex gap-5">
          <ThemeToogle />
        </div>
      </header>
    );
  } else {
    return null;
  }
}
