"use client";
import {
  Database,
  LayoutGridIcon,
  LogOut,
  TrainFrontIcon,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import TooltipComponents from "../features/tooltip/TooltipComponent";
import { usePathname } from "next/navigation";
import icon from "/public/icon.png";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const unprotectedPath = ["/login"];

  if (!unprotectedPath.includes(pathname)) {
    return (
      <aside className="h-screen fixed top-0 left-0 bottom-0 bg-white z-20">
        <nav className="w-16 text-slate-600 h-full border-r py-7 flex item-center flex-col shadow-sm justify-between">
          <div className="flex flex-col gap-5 justify-center items-center">
            <Image src={icon} alt="Fastpect Icon" className="w-9" />
            <div className="space-y-2">
              <p className="text-sm text-center">Menu</p>
              <TooltipComponents content="Dashboard">
                <Link href="/" className="flex justify-center">
                  <div
                    className={`p-2 hover:bg-primary ${
                      pathname == "/" ? "bg-primary text-white" : ""
                    } hover:text-white rounded-lg`}
                  >
                    <LayoutGridIcon size={25} />
                  </div>
                </Link>
              </TooltipComponents>
            </div>
            <div className="mt-10 space-y-2">
              <p className="text-sm text-center">Client</p>
              <TooltipComponents content="Stasiun">
                <Link href="/stasiun" className="flex justify-center">
                  <div
                    className={`p-2 hover:bg-primary ${
                      pathname == "/stasiun" ? "bg-primary text-white" : ""
                    } hover:text-white rounded-lg`}
                  >
                    <TrainFrontIcon size={25} />
                  </div>
                </Link>
              </TooltipComponents>
              <TooltipComponents content="User">
                <Link href="/user" className="flex justify-center">
                  <div
                    className={`p-2 hover:bg-primary ${
                      pathname == "/user" ? "bg-primary text-white" : ""
                    } hover:text-white rounded-lg`}
                  >
                    <User size={25} />
                  </div>
                </Link>
              </TooltipComponents>
              <TooltipComponents content="Mesin">
                <Link href="/mesin" className="flex justify-center">
                  <div
                    className={`p-2 hover:bg-primary ${
                      pathname == "/mesin" ? "bg-primary text-white" : ""
                    } hover:text-white rounded-lg`}
                  >
                    <Wrench size={25} />
                  </div>
                </Link>
              </TooltipComponents>

              <TooltipComponents content="Database">
                <Link href="/database" className="flex justify-center">
                  <div
                    className={`p-2 hover:bg-primary ${
                      pathname == "/database" ? "bg-primary text-white" : ""
                    } hover:text-white rounded-lg`}
                  >
                    <Database size={25} />
                  </div>
                </Link>
              </TooltipComponents>
            </div>
          </div>
          <div className="">
            <TooltipComponents content="Logout" classname="bg-danger">
              <Link href="/login" className="flex justify-center">
                <div className="p-2 hover:bg-danger hover:text-white rounded-lg">
                  <LogOut size={25} />
                </div>
              </Link>
            </TooltipComponents>
          </div>
        </nav>
      </aside>
    );
  }
  return null;
}
