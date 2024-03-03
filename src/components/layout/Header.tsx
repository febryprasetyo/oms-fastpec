"use client";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import ThemeToogle from "../features/theme/ThemeToogle";
import { useExpandedStore } from "@/services/store";
import { Button } from "../ui/button";
import { ChevronsRightIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import HeaderSkeleton from "../features/skeleton/HeaderSkeleton";

type Props = {};

export default function Header({}: Props) {
  const pathname = usePathname();
  // State untuk mengecek apakah sidebar sedang di expanded atau tidak
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const setExpanded = useExpandedStore((state: Expanded) => state.setExpanded);
  // Route yang akan di render header
  const renderRoute = ["/", "/stasiun", "/user", "/mesin", "/database"];
  const session = useSession();

  // Jika route ada di dalam array, maka render header
  if (renderRoute.includes(pathname)) {
    return (
      // Jika sidebar di expanded, maka tambahkan padding left
      <header
        className={`flex w-full items-center justify-between px-5 py-5 transition-none sm:px-10 ${
          isExpanded ? "pl-20 sm:pl-24" : ""
        }`}
      >
        <div className="flex items-center gap-5">
          {/* Jika sidebar tidak di expanded, maka tampilkan button untuk expanded sidebar */}
          {!isExpanded ? (
            <Button
              className="bg-transparent text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-700 dark:text-white dark:hover:bg-dark_accent"
              size="icon"
              onClick={() => {
                setExpanded(true);
              }}
            >
              <ChevronsRightIcon size={25} />
            </Button>
          ) : null}

          {/* Jika session sudah ada, maka tampilkan avatar dan username jika
          tidak tampilkan skeleton */}
          {session.data?.user?.user_data?.username ? (
            <>
              <Avatar>
                <AvatarImage src="" alt="Profile Picture" />
                <AvatarFallback>
                  {session.data?.user?.user_data?.username.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-slate-600 dark:text-slate-300">
                  Selamat datang ,
                </p>
                <strong className="text-lg font-semibold text-slate-800 dark:text-white">
                  {session.data?.user?.user_data?.username}
                </strong>
              </div>
            </>
          ) : (
            <HeaderSkeleton />
          )}
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
