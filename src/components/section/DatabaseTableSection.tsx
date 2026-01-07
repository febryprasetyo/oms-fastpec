"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDatabaseList } from "@/services/api/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LimitPage from "@/components/features/limitPage/LimitPage";
import { DatePicker } from "../features/form/DatePicker";
import { format, parseISO, subMonths, isValid } from "date-fns";
import { Button } from "../ui/button";
import { Trash, Calendar, Filter, FileDown, Search, ArrowRight } from "lucide-react";
import { getStationList } from "@/services/api/station";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ReusablePagination } from "../features/pagination";
import ExportForm from "../features/export/ExportForm";

type Props = {
  cookie: string;
  limit: string;
  page: string;
};

export default function DatabaseTableSection({ cookie, limit, page }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [today, setToday] = useState<Date | undefined>(undefined);
  const [threeMonthsAgo, setThreeMonthsAgo] = useState<Date | undefined>(undefined);

  // Initial state from URL or defaults
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [stationFilter, setStationFilter] = useState<string>("all");
  const [startHour, setStartHour] = useState<Date | undefined>(undefined);
  const [endHour, setEndHour] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);

  // Sync state from URL on mount only
  useEffect(() => {
    const now = new Date();
    const tma = subMonths(now, 3);
    setToday(now);
    setThreeMonthsAgo(tma);

    const urlStation = searchParams.get("station") || "all";
    const urlStart = searchParams.get("startDate");
    const urlEnd = searchParams.get("endDate");

    if (urlStart && isValid(parseISO(urlStart))) setStartDate(parseISO(urlStart));
    else setStartDate(tma);

    if (urlEnd && isValid(parseISO(urlEnd))) setEndDate(parseISO(urlEnd));
    else setEndDate(now);

    setStationFilter(urlStation);
    setStartHour(now);
    setEndHour(now);
    setIsReady(true);
  }, []);

  const updateFilters = (newStation?: string, newStart?: Date, newEnd?: Date) => {
    if (!isReady) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Always reset page on filter change
    
    if (newStation !== undefined) {
      if (newStation === "all") params.delete("station");
      else params.set("station", newStation);
      setStationFilter(newStation);
    }
    
    if (newStart !== undefined) {
      params.set("startDate", format(newStart, "yyyy-MM-dd"));
      setStartDate(newStart);
    }
    
    if (newEnd !== undefined) {
      params.set("endDate", format(newEnd, "yyyy-MM-dd"));
      setEndDate(newEnd);
    }

    // Small timeout to allow UI (Select/Popover) to settle
    setTimeout(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 50);
  };

  const setQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    updateFilters(undefined, start, end);
    setStartHour(undefined);
    setEndHour(undefined);
  };

  const dateQueryKey =
    startDate && endDate
      ? {
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        }
      : null;
  const hourQueryKey =
    dateQueryKey && startHour && endHour ? { startHour, endHour } : null;

  const dbQuery = useQuery({
    queryKey: [
      "database",
      {
        startDate: dateQueryKey?.startDate || null,
        endDate: dateQueryKey?.endDate || null,
        startHour: hourQueryKey?.startHour || null,
        endHour: hourQueryKey?.endHour || null,
        stationFilter,
        page,
        limit,
      },
    ],
    queryFn: () => {
      return getDatabaseList({
        cookie,
        startHour,
        endHour,
        startDate,
        endDate,
        stationFilter,
        page,
        limit,
      });
    },
    enabled: isReady,
    refetchInterval: false,
  });

  const stationQuery = useQuery({
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(cookie);
    },
  });

  const handleResetFilter = () => {
    if (!today || !threeMonthsAgo) return;
    setStartDate(threeMonthsAgo);
    setEndDate(today);
    setStartHour(undefined);
    setEndHour(undefined);
    setStationFilter("all");
    router.push(pathname, { scroll: false });
  };

  return (
    <section className="space-y-4">
      {/* Compact Minimalist Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-darkSecondary dark:border-dark_accent/30 p-4 shadow-sm transition-all">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
          {/* Left: Filters Group */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Station Filter */}
            <div className="w-full sm:w-48">
              <Select
                value={stationFilter}
                onValueChange={(value: string) => {
                  updateFilters(value);
                }}
                defaultValue="all"
              >
                <SelectTrigger className="h-10 rounded-lg bg-slate-50 dark:bg-dark/40 border-slate-200 dark:border-dark_accent text-xs font-medium">
                  <SelectValue placeholder="Semua Stasiun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Semua Stasiun</SelectItem>
                    {stationQuery?.data?.data?.values.map((item, index) => (
                      <SelectItem key={index} value={item.nama_stasiun}>
                        {item.nama_stasiun}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Group */}
            <div className="flex h-10 items-center gap-1 bg-slate-50 dark:bg-dark/40 px-3 rounded-lg border border-slate-200 dark:border-dark_accent">
              <DatePicker
                date={startDate}
                setDate={(date) => updateFilters(undefined, date)}
                placeholder="Mulai"
                className="h-8 border-none bg-transparent shadow-none hover:bg-slate-200/50"
              />
              <ArrowRight className="h-3 w-3 text-slate-400 mx-1" />
              <DatePicker
                date={endDate}
                setDate={(date) => updateFilters(undefined, undefined, date)}
                placeholder="Sampai"
                className="h-8 border-none bg-transparent shadow-none hover:bg-slate-200/50"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              {[1, 7, 30].map((days) => (
                <Button
                  key={days}
                  type="button"
                  variant="outline"
                  className="h-10 text-[11px] px-3 rounded-lg border-slate-200 bg-slate-50 dark:bg-dark/40 dark:border-dark_accent text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider hover:bg-primary hover:border-primary hover:text-white transition-all shadow-sm"
                  onClick={() => setQuickFilter(days)}
                >
                  {days === 1 ? "1 Day" : `${days} Days`}
                </Button>
              ))}
            </div>

            
          </div>

          {/* Right: Actions Group */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilter}
              className="h-10 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Trash className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
            <ExportForm
              token={cookie}
              type="database"
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              stationFilter={stationFilter}
              stationList={stationQuery?.data?.data?.values}
            />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-darkSecondary">
        {/* Table Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Data Onlimo
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {dbQuery?.data?.totalData ?? 0} total data ditemukan
          </p>
        </div>
        
        {/* Table Container with Scroll */}
        <div className="overflow-x-auto">
        {dbQuery?.data?.success && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead className="min-w-[180px]">ID Stasiun</TableHead>
                  <TableHead className="min-w-[160px]">Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead className="min-w-[100px]">Suhu</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>DO</TableHead>
                  <TableHead>PH</TableHead>
                  <TableHead>Turbidity</TableHead>
                  <TableHead>Kedalaman</TableHead>
                  <TableHead>Nitrat</TableHead>
                  <TableHead>Amonia</TableHead>
                  <TableHead>COD</TableHead>
                  <TableHead>BOD</TableHead>
                  <TableHead>TSS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbQuery?.data?.data?.map((item, index) => {
                  let data: payload;
                  try {
                    const parsed = typeof item?.payload === 'string' ? JSON.parse(item?.payload) : item?.payload;
                    data = parsed?.data || parsed;
                  } catch (e) {
                    console.error("Error parsing payload", e);
                    data = {} as payload;
                  }
                  return (
                    <TableRow key={index} data-testid="data-table">
                      <TableCell>
                        {page == "1"
                          ? index + 1
                          : (parseInt(page) - 1) * parseInt(limit) +
                            (index + 1)}
                      </TableCell>
                      <TableCell className="w-[200px]">
                        {data.IDStasiun == undefined ? "-" : data.IDStasiun}
                      </TableCell>
                      <TableCell>
                        {data.Tanggal == undefined ? "-" : data.Tanggal}
                      </TableCell>
                      <TableCell>
                        {data.Jam == undefined ? "-" : data.Jam}
                      </TableCell>
                      <TableCell>
                        {data.Suhu == undefined ? "-" : data.Suhu}
                      </TableCell>
                      <TableCell>
                        {data.TDS == undefined ? "-" : data.TDS}
                      </TableCell>
                      <TableCell>
                        {data.DO == undefined ? "-" : data.DO}
                      </TableCell>
                      <TableCell>
                        {data.PH == undefined ? "-" : data.PH}
                      </TableCell>
                      <TableCell>
                        {data.Turbidity == undefined ? "-" : data.Turbidity}
                      </TableCell>
                      <TableCell>
                        {data.Kedalaman == undefined ? "-" : data.Kedalaman}
                      </TableCell>
                      <TableCell>
                        {data.Nitrat == undefined ? "-" : data.Nitrat}
                      </TableCell>
                      <TableCell>{data.Amonia ? data.Amonia : "-"}</TableCell>
                      <TableCell>
                        {data.COD == undefined ? "-" : data.COD}
                      </TableCell>
                      <TableCell>
                        {data.BOD == undefined ? "-" : data.BOD}
                      </TableCell>
                      <TableCell>
                        {data.TSS == undefined ? "-" : data.TSS}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
        </div>
        
        {/* Pagination */}
        {dbQuery?.data?.success && (
          <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            <ReusablePagination
              currentPage={parseInt(page)}
              totalData={Number(dbQuery?.data?.totalData)}
              limit={parseInt(limit)}
            />
          </div>
        )}
        
        {dbQuery?.isPending && (
          <div className="flex h-[400px] animate-pulse items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-lg text-slate-500">Memuat data...</p>
            </div>
          </div>
        )}
        {!dbQuery?.data?.success && !dbQuery?.isPending && (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-red-500">
                Gagal memuat data: {dbQuery?.error?.message || "Network Error"}
              </p>
              <p className="mt-1 text-sm text-slate-400">Coba muat ulang halaman</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
