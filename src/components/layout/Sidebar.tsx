"use client";
import {
  ChevronsLeftIcon,
  Database,
  LayoutGridIcon,
  LogOut,
  Settings,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import TooltipComponents from "../features/tooltip/TooltipComponent";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useExpandedStore } from "@/services/store";

export default function Sidebar() {
  const pathname = usePathname();
  const expanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const setIsExpanded = useExpandedStore(
    (state: Expanded) => state.setExpanded
  );

  const unprotectedPath = ["/login"];

  if (!unprotectedPath.includes(pathname)) {
    return (
      <aside
        className={`h-screen fixed top-0 bottom-0 bg-white dark:bg-darkSecondary z-20 dark:text-white transition-all duration-300 ease-in-out ${
          expanded ? "left-0" : "-left-16"
        }`}
      >
        <nav className="w-16 text-slate-600 h-full py-[27px] flex item-center flex-col shadow-sm justify-between">
          <div className="flex flex-col gap-5 justify-center items-center">
            <Button
              className="text-slate-700 bg-transparent hover:bg-slate-100 hover:text-slate-700 dark:text-white dark:hover:bg-dark_accent"
              size="icon"
              onClick={() => {
                setIsExpanded(false);
              }}
            >
              <ChevronsLeftIcon size={25} />
            </Button>
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm text-center dark:text-white">Menu</p>
                <TooltipComponents content="Dashboard">
                  <Link href="/" className="flex justify-center">
                    <div
                      className={`p-2 hover:bg-primary dark:text-white ${
                        pathname == "/" ? "bg-primary text-white" : ""
                      } hover:text-white rounded-lg`}
                    >
                      <LayoutGridIcon size={25} />
                    </div>
                  </Link>
                </TooltipComponents>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-center dark:text-white">Client</p>
                <TooltipComponents content="Stasiun">
                  <Link href="/stasiun" className="flex justify-center">
                    <div
                      className={`p-2 hover:bg-primary dark:text-white ${
                        pathname == "/stasiun" ? "bg-primary text-white" : ""
                      } hover:text-white rounded-lg`}
                    >
                      <Settings size={25} />
                    </div>
                  </Link>
                </TooltipComponents>
                <TooltipComponents content="User">
                  <Link href="/user" className="flex justify-center">
                    <div
                      className={`p-2 hover:bg-primary dark:text-white ${
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
                      className={`p-2 hover:bg-primary dark:text-white ${
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
                      className={`p-2 hover:bg-primary dark:text-white ${
                        pathname == "/database" ? "bg-primary text-white" : ""
                      } hover:text-white rounded-lg`}
                    >
                      <Database size={25} />
                    </div>
                  </Link>
                </TooltipComponents>
              </div>
            </div>
          </div>
          <div className="">
            <TooltipComponents
              content="Logout"
              classname="bg-danger dark:bg-danger"
            >
              <Link href="/login" className="flex justify-center">
                <div className="p-2 hover:bg-danger hover:text-white dark:text-white rounded-lg">
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
