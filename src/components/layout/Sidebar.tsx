"use client";
import {
  ChevronsLeftIcon,
  Database,
  LayoutGridIcon,
  LogOut,
  Settings,
  User,
  Wrench,
  History,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TooltipComponents from "../features/tooltip/TooltipComponent";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useAuthStore, useExpandedStore } from "@/services/store";
import NavLinkSkeleton from "../features/skeleton/NavLinkSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function Sidebar() {
  const pathname = usePathname();
  const expanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const setIsExpanded = useExpandedStore(
    (state: Expanded) => state.setExpanded,
  );
  const router = useRouter();

  const user = useAuthStore((state) => state?.user);

  if (pathname.includes("/monitoring")) {
    return null;
  }

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
            aria-label="Close Sidebar"
          >
            <ChevronsLeftIcon size={25} />
          </Button>
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-center text-sm dark:text-white">Menu</p>
              <TooltipComponents
                content="Dashboard"
                Icon={LayoutGridIcon}
                pathname={pathname}
                to="/dashboard"
              />
              <TooltipComponents
                content="Database"
                to="/database"
                pathname={pathname}
                Icon={Database}
              />
              <TooltipComponents
                content="History"
                to="/history"
                pathname={pathname}
                Icon={History}
              />
            </div>
            {/* Link Client Hanya Akan di Render Ketika role = Admin */}
            {user?.user_data?.role_name === "Admin" ? (
              <div className="space-y-2">
                <p className="text-center text-sm dark:text-white">Admin</p>
                <TooltipComponents
                  content="Stasiun"
                  to="/stasiun"
                  pathname={pathname}
                  Icon={Settings}
                />
                <TooltipComponents
                  content="User"
                  to="/user"
                  pathname={pathname}
                  Icon={User}
                />
                <TooltipComponents
                  content="Mesin"
                  to="/mesin"
                  pathname={pathname}
                  Icon={Wrench}
                />
              </div>
            ) : // Jika role = User, maka tidak akan di render dan akan di ganti dengan component skeleton
            user?.user_data?.role_name === "User" ? null : (
              <NavLinkSkeleton />
            )}
          </div>
        </div>
        <div>
          <div className="flex justify-center bg-transparent hover:text-white">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="rounded-lg bg-transparent p-2 text-slate-700 hover:bg-danger hover:text-white dark:text-white"
                  aria-label="logout-trigger"
                >
                  <LogOut size={25} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Apakah anda yakin ingin logout?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan di arahkan ke halaman login
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    aria-label="logout-action"
                    className="bg-danger hover:bg-red-800"
                    onClick={() => {
                      useAuthStore.getState().doLogout();
                      router.push("/login");
                    }}
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </nav>
    </aside>
  );
}
