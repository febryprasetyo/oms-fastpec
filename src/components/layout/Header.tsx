"use client";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = {};

export default function Header({}: Props) {
  const pathname = usePathname();
  const unprotectedPath = ["/login"];

  if (!unprotectedPath.includes(pathname)) {
    return (
      <header className="w-full pl-20 py-5 px-5 sm:px-10 sm:pl-24 flex justify-between items-center">
        <div className="">
          <p className="text-slate-600">Selamat datang ,</p>
          <strong className="text-lg font-semibold text-slate-800">
            Admin
          </strong>
        </div>
        <div className="">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>Ad</AvatarFallback>
          </Avatar>
        </div>
      </header>
    );
  } else {
    return null;
  }
}
