"use client";
import { parse } from "cookie";
import { getStationList } from "@/services/api/station";
import { Suspense, useEffect, useState } from "react";
import StasiunCard from "../features/card/StasiunCard";
import CardSkeleton from "../features/skeleton/CardSkeleton";
import { useQuery } from "@tanstack/react-query";
import DetailCard from "../features/card/DetailCard";
import { FaWifi, FaChargingStation } from "react-icons/fa";
import { HiStatusOnline, HiStatusOffline } from "react-icons/hi";
import { useAuthStore, useExpandedStore } from "@/services/store";
import { useKlhkList } from "@/hook/useKlhkList";
import { KlhkTable } from "@/components/features/dataTable/KlhkTable";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { getStationDetail } from "@/services/api/station";
import { isAdminOrEngineering, isAdminOrEngineeringById } from "@/lib/roleHelper";
import { ChevronRight, Search } from "lucide-react";

type Props = {
  cookie: string;
};

type FilterType = "all" | "online" | "offline";

export default function DashboardSection({ cookie }: Props) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading } = useKlhkList(cookie);

  const stationQuery = useQuery({
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(cookie);
    },
  });

  const detailQuery = useQuery({
    queryKey: ["station-detail"],
    queryFn: () => {
      return getStationDetail(cookie);
    },
  });

  const user = useAuthStore((state) => state?.user);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const authData = localStorage.getItem("auth-storage");
        if (authData) {
          const parsed = JSON.parse(authData);
          const roleId = parsed?.state?.user?.user_data?.role_id;
          setIsAdmin(isAdminOrEngineeringById(roleId));
        }
      } catch (err) {
        console.error("Failed to parse auth-storage:", err);
        setIsAdmin(false);
      }
    }
  }, []);

  // Filter station data berdasarkan status dan search
  const stationData = Array.isArray(detailQuery?.data?.data)
    ? detailQuery.data.data
    : [];

  const filteredStations = stationData.filter((item: any) => {
    // Normalize status to lowercase for comparison
    const itemStatus = (item.status || "").toLowerCase();
    const isOnline = itemStatus === "hidup";
    const isOffline = itemStatus === "mati";
    
    // Filter by status
    if (filter === "online" && !isOnline) return false;
    if (filter === "offline" && !isOffline) return false;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = (item.nama_stasiun || "").toLowerCase().includes(query);
      const matchId = (item.id_mesin || "").toLowerCase().includes(query);
      if (!matchName && !matchId) return false;
    }
    
    return true;
  });

  // Statistics
  const totalStations = (detailQuery?.data as any)?.total ?? 0;
  const onlineStations = (detailQuery?.data as any)?.Hidup ?? 0;
  const offlineStations = (detailQuery?.data as any)?.Mati ?? 0;

  // KLHK data - limit to 15 rows
  const klhkDataLimited = data?.slice(0, 15) ?? [];

  const parsed = parse(cookie);

  return (
    <section className="min-h-screen">
      {/* Statistics Cards - Filters */}
      {isAdminOrEngineering(user?.user_data?.role_name) && (
        <div className="mb-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total Card */}
          <div 
            onClick={() => setFilter("all")}
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md ${
              filter === "all" 
                ? "border-blue-500 bg-blue-50/50 shadow-sm" 
                : "border-slate-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
              <FaChargingStation size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Stasiun</p>
              <p className="text-2xl font-bold text-slate-800">{totalStations}</p>
            </div>
          </div>
          
          {/* Online Card */}
          <div 
            onClick={() => setFilter("online")}
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md ${
              filter === "online" 
                ? "border-emerald-500 bg-emerald-50/50 shadow-sm" 
                : "border-slate-200 bg-white hover:border-emerald-200"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <HiStatusOnline size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Online</p>
              <p className="text-2xl font-bold text-slate-800">{onlineStations}</p>
            </div>
          </div>
          
          {/* Offline Card */}
          <div 
            onClick={() => setFilter("offline")}
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md ${
              filter === "offline" 
                ? "border-red-500 bg-red-50/50 shadow-sm" 
                : "border-slate-200 bg-white hover:border-red-200"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white">
              <HiStatusOffline size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Offline</p>
              <p className="text-2xl font-bold text-slate-800">{offlineStations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama stasiun atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-0 bg-transparent py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Station Cards Section */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Stasiun
              {filter !== "all" && (
                <span className="ml-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {filter === "online" ? "Online" : "Offline"}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredStations.length} stasiun pemantauan
              {filter !== "all" && " ditampilkan"}
            </p>
          </div>
          {filter !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("all")}
              className="text-slate-600"
            >
              Tampilkan Semua
            </Button>
          )}
        </div>

        <div 
          key={`grid-${filter}-${searchQuery}`}
          className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {filteredStations.length > 0 ? (
            filteredStations.map((item: any, index: number) => {
              // Normalize status for consistent display
              const normalizedStatus = (item.status || "").toLowerCase() === "hidup" ? "hidup" : "mati";
              return (
                <Suspense fallback={<CardSkeleton />} key={`${item.uuid}-${index}`}>
                  <StasiunCard
                    time={item.time}
                    city={item.status}
                    id={item.id_mesin}
                    name={item.nama_stasiun}
                    status={normalizedStatus}
                    ikaScore={item.ika_score ?? 0}
                    paramDominan={item.param_dominan ?? "-"}
                  />
                </Suspense>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FaWifi className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-600">
                {filter === "all"
                  ? "Data tidak ditemukan"
                  : `Tidak ada stasiun ${filter === "online" ? "online" : "offline"}`}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {filter !== "all"
                  ? "Coba filter lainnya"
                  : "Silahkan coba lagi atau hubungi admin"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KLHK Integration Table - User Role Only */}
      {!isAdminOrEngineering(user?.user_data?.role_name) &&
        user?.user_data?.role_name === "User" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Integrasi Data
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Sinkronisasi data stasiun pemantauan dengan KLHK
                </p>
              </div>
              <Button
                onClick={() => router.push("/database")}
                className="group gap-2"
              >
                Lihat Selengkapnya
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              <KlhkTable data={klhkDataLimited} />
            )}
          </div>
        )}
    </section>
  );
}
