"use client";
import {
  ChevronsLeftIcon,
  Database,
  LayoutGridIcon,
  LogOut,
  HouseWifi,
  Settings,
  User,
  Newspaper,
  Wrench,
  History,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useAuthStore, useExpandedStore } from "@/services/store";
import NavLinkSkeleton from "../features/skeleton/NavLinkSkeleton";
import { isAdminOrEngineering } from "@/lib/roleHelper";
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
import Logo from '@/assets/img/logo.png';

import Image from "next/image";
import Link from "next/link";

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

  const MenuItem = ({
    to,
    label,
    Icon,
  }: {
    to: string;
    label: string;
    Icon: any;
  }) => {
    const isActive = pathname === to;
    return (
      <Link
        href={to}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark/40 dark:hover:text-slate-100"
        )}
      >
        {isActive && (
          <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
        )}
        <Icon size={20} className={cn(
          "transition-colors",
          isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
        )} />
        <span className={cn(
          "text-sm font-semibold transition-all",
          isActive ? "translate-x-1" : ""
        )}>{label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed bottom-0 top-0 z-50 h-screen w-full sm:w-64 border-r border-slate-200 bg-white/95 backdrop-blur-2xl transition-all duration-300 ease-in-out dark:border-dark_accent/30 dark:bg-darkSecondary dark:text-white",
        expanded ? "left-0" : "-left-full sm:-left-64"
      )}
    >
      <nav className="flex h-full w-full flex-col justify-between px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Logo Section */}
          <div className="flex items-center justify-between pl-2 pr-1">
            <div className="flex items-center gap-2">
              <Image
                  src={Logo}
                  alt="Logo Icon"
                  className="w-[130px]"
                />
              
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-dark/60"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronsLeftIcon size={20} className="text-slate-500" />
            </Button>
          </div>

          {/* Main Menu */}
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="mb-2 flex items-center gap-2 px-2">
                <div className="h-[1px] flex-1 bg-slate-100 dark:bg-dark_accent/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Overview</span>
              </div>
              <MenuItem to="/dashboard" label="Dashboard" Icon={LayoutGridIcon} />
              <MenuItem to="/database" label="Database" Icon={Database} />
              <MenuItem to="/history" label="History" Icon={History} />
            </div>

            {/* Admin Section */}
            {isAdminOrEngineering(user?.user_data?.role_name) ? (
              <div className="space-y-1">
                <div className="mb-2 flex items-center gap-2 px-2">
                  <div className="h-[1px] flex-1 bg-slate-100 dark:bg-dark_accent/30" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Management</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <MenuItem to="/stasiun" label="Stasiun" Icon={HouseWifi} />
                  <MenuItem to="/user" label="User" Icon={User} />
                  <MenuItem to="/mesin" label="Mesin" Icon={Wrench} />
                  <MenuItem to="/inventory" label="Inventory" Icon={Newspaper} />
                  <MenuItem to="/pengajuan" label="Pengajuan" Icon={FolderKanban} />
                  <MenuItem to="/maintenance" label="Maintenance" Icon={Settings} />
                </div>
              </div>
            ) : user?.user_data?.role_name === "User" ? null : (
              <NavLinkSkeleton />
            )}
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="group flex w-full items-center justify-start gap-3 rounded-xl px-4 py-6 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-red-100 dark:bg-dark/40 dark:group-hover:bg-red-900/30 transition-colors">
                  <LogOut size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">Logout</span>
                  <span className="text-[10px] text-slate-400">Sign out of your account</span>
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl dark:bg-darkSecondary dark:border-dark_accent">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Sign Out</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  Are you sure you want to log out? You will need to sign in again to access the dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-xl bg-red-500 font-bold hover:bg-red-600"
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
      </nav>
    </aside>
  );
}
