"use client";
import { usePathname } from "next/navigation";
import { useAuthStore, useExpandedStore } from "@/services/store";
import { Button } from "../ui/button";
import { ChevronsRightIcon } from "lucide-react";
import HeaderSkeleton from "../features/skeleton/HeaderSkeleton";

type Props = {};

// Page titles mapping
const getPageTitle = (pathname: string) => {
  const routes: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": { title: "Dashboard", subtitle: "Sistem Pemantauan Kualitas Air Online" },
    "/database": { title: "Database", subtitle: "Data Pemantauan Kualitas Air" },
    "/history": { title: "History", subtitle: "Riwayat Data Pemantauan" },
    "/mesin": { title: "Daftar Mesin", subtitle: "Manajemen Perangkat Monitoring" },
    "/stasiun": { title: "Daftar Stasiun", subtitle: "Manajemen Stasiun Pemantauan" },
    "/user": { title: "Manajemen User", subtitle: "Kelola Akun Pengguna" },
    "/inventory": { title: "Inventory", subtitle: "Stok dan Manajemen Barang" },
    "/pengajuan": { title: "Pengajuan", subtitle: "Permintaan dan Persetujuan" },
    "/maintenance": { title: "Maintenance", subtitle: "Kontrol dan Perbaikan Stasiun" },
  };
  
  return routes[pathname] || { title: "OMS Fastpec", subtitle: "Online Monitoring System" };
};

export default function Header({}: Props) {
  const pathname = usePathname();
  const isExpanded = useExpandedStore((state: Expanded) => state.isExpanded);
  const setExpanded = useExpandedStore((state: Expanded) => state.setExpanded);

  const user = useAuthStore((state) => state?.user);
  const { title, subtitle } = getPageTitle(pathname);

  if (pathname.includes("/monitoring")) {
    return null;
  }

  return (
    <header
      className={`px-5 py-5 transition-all sm:px-10 ${
        isExpanded ? "sm:pl-72" : ""
      }`}
    >
      <div className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 p-5 text-white shadow-lg">
        {/* Toggle Sidebar Button */}
        {!isExpanded && (
          <Button
            className="bg-white/10 text-white transition-all hover:bg-white/20"
            size="icon"
            onClick={() => setExpanded(true)}
          >
            <ChevronsRightIcon size={20} />
          </Button>
        )}

        {/* Title Section */}
        <div className="flex-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-slate-300">{subtitle}</p>
        </div>

        {/* User Info */}
        {user?.user_data?.username ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-400">Selamat datang,</p>
              <p className="font-semibold">{user.user_data.username}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {user.user_data.username.substring(0, 2).toUpperCase()}
            </div>
          </div>
        ) : (
          <HeaderSkeleton />
        )}
      </div>
    </header>
  );
}
