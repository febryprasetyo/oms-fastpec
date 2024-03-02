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

import TooltipComponents from "../features/tooltip/TooltipComponent";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useExpandedStore } from "@/services/store";
import { signOut, useSession } from "next-auth/react";
import NavLink from "../ui/NavLink";
import NavLinkSkeleton from "../features/skeleton/NavLinkSkeleton";

export default function Sidebar() {
  const pathname = usePathname();
  const expanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const setIsExpanded = useExpandedStore(
    (state: Expanded) => state.setExpanded,
  );
  const session = useSession();
  // Route yang akan di render sidebar
  const renderRoute = ["/", "/stasiun", "/user", "/mesin", "/database"];

  // Jika route ada di dalam array, maka render sidebar
  if (renderRoute.includes(pathname)) {
    return (
      <aside
        className={`fixed bottom-0 top-0 z-20 h-screen bg-white transition-all duration-300 ease-in-out dark:bg-darkSecondary dark:text-white ${
          expanded ? "left-0" : "-left-16"
        }`}
      >
        <nav className="item-center flex h-full w-16 flex-col justify-between py-[27px] text-slate-600 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-5">
            <Button
              className="bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-700 dark:text-white dark:hover:bg-dark_accent"
              size="icon"
              onClick={() => {
                setIsExpanded(false);
              }}
            >
              <ChevronsLeftIcon size={25} />
            </Button>
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-center text-sm dark:text-white">Menu</p>
                <TooltipComponents content="Dashboard">
                  <NavLink pathname={pathname} to="/">
                    <LayoutGridIcon size={25} />
                  </NavLink>
                </TooltipComponents>
              </div>
              {/* Link Client Hanya Akan di Render Ketika role = Admin */}
              {session.data?.user?.user_data?.role_name === "Admin" ? (
                <div className="space-y-2">
                  <p className="text-center text-sm dark:text-white">Client</p>
                  <TooltipComponents content="Stasiun">
                    <NavLink pathname={pathname} to="/stasiun">
                      <Settings size={25} />
                    </NavLink>
                  </TooltipComponents>
                  <TooltipComponents content="User">
                    <NavLink pathname={pathname} to="/user">
                      <User size={25} />
                    </NavLink>
                  </TooltipComponents>
                  <TooltipComponents content="Mesin">
                    <NavLink pathname={pathname} to="/mesin">
                      <Wrench size={25} />
                    </NavLink>
                  </TooltipComponents>
                  <TooltipComponents content="Database">
                    <NavLink pathname={pathname} to="/database">
                      <Database size={25} />
                    </NavLink>
                  </TooltipComponents>
                </div>
              ) : // Jika role = User, maka tidak akan di render dan akan di ganti dengan component skeleton
              session.data?.user?.user_data?.role_name === "User" ? null : (
                <NavLinkSkeleton />
              )}
            </div>
          </div>
          <div className="">
            <TooltipComponents
              content="Logout"
              classname="bg-danger dark:bg-danger"
            >
              <div className="flex justify-center bg-transparent hover:text-white">
                <Button
                  className="rounded-lg p-2 text-slate-700 hover:bg-danger hover:text-white dark:text-white"
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                  }}
                >
                  <LogOut size={25} />
                </Button>
              </div>
            </TooltipComponents>
          </div>
        </nav>
      </aside>
    );
  }
  return null;
}
