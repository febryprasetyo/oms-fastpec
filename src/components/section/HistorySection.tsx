"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";
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
import { format, parseISO, subMonths } from "date-fns";
import { Button } from "../ui/button";
import { Trash, Filter, History, Search, FileDown, ArrowRight } from "lucide-react";
import { toast } from "../ui/use-toast";
import { getStationList } from "@/services/api/station";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { isValid } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { exportHistory, getHistoryList } from "@/services/api/history";
import { ReusablePagination } from "../features/pagination";
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
import ExportForm from "../features/export/ExportForm";

type Props = {
  cookie: string;
  searchParams: {
    page?: string;
    limit?: string;
  };
};

export default function HistorySection({ cookie, searchParams: pageParams }: Props) {
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
  const page = pageParams?.page || "1";
  const limit = pageParams?.limit || "10";

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
      "history",
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
      return getHistoryList({
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
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              token={cookie}
              type="history"
              stationFilter={stationFilter}
              stationList={stationQuery?.data?.data?.values}
            />
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {dbQuery?.data?.success && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead className="min-w-[180px]">Nama Stasiun</TableHead>
                  <TableHead className="min-w-[160px]">Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead className="min-w-[100px]">Suhu</TableHead>
                  <TableHead>DO</TableHead>
                  <TableHead>Tur</TableHead>
                  <TableHead>CT</TableHead>
                  <TableHead>PH</TableHead>
                  <TableHead>ORP</TableHead>
                  <TableHead>BOD</TableHead>
                  <TableHead>COD</TableHead>
                  <TableHead>TSS</TableHead>
                  <TableHead>N</TableHead>
                  <TableHead>NO3 3</TableHead>
                  <TableHead>NO2</TableHead>
                  <TableHead>Depth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbQuery?.data?.data?.map(
                  (item, index) => (
                    console.log(item),
                    (
                      <TableRow key={index}>
                        <TableCell>
                          {" "}
                          {page == "1"
                            ? index + 1
                            : (parseInt(page) - 1) * parseInt(limit) +
                              (index + 1)}
                        </TableCell>
                        <TableCell>{item.nama_stasiun}</TableCell>
                        <TableCell>{format(item.time, "yyyy-MM-dd")}</TableCell>
                        <TableCell>{format(item.time, "HH:mm")}</TableCell>
                        <TableCell>{item.temperature}</TableCell>
                        <TableCell>{item.DO}</TableCell>
                        <TableCell>{item.TUR}</TableCell>
                        <TableCell>{item.TDS}</TableCell>
                        <TableCell>{item.PH}</TableCell>
                        <TableCell>{item.ORP}</TableCell>
                        <TableCell>{item.BOD}</TableCell>
                        <TableCell>{item.COD}</TableCell>
                        <TableCell>{item.TSS}</TableCell>
                        <TableCell>{item.Amonia}</TableCell>
                        <TableCell>{item.NO3}</TableCell>
                        <TableCell>{item.NO2}</TableCell>
                        <TableCell>{item.Depth}</TableCell>
                      </TableRow>
                    )
                  ),
                ) ?? <></>}
              </TableBody>
            </Table>
            <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700" id="pagination">
              <ReusablePagination
                currentPage={parseInt(page)}
                limit={parseInt(limit)}
                totalData={parseInt(dbQuery?.data?.totalData)}
              />
            </div>
          </>
        )}
        {dbQuery?.isPending && (
          <div className="flex h-[400px] animate-pulse items-center justify-center">
            <p className="text-lg">Memuat data...</p>
          </div>
        )}
        {!dbQuery?.data?.success && !dbQuery?.isPending && (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-red-500">
              Gagal memuat data: {dbQuery?.error?.message || "Network Error"} ,
              Coba muat ulang halaman
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
