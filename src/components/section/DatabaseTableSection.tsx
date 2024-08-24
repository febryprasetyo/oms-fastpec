"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { exportDatabase, getDatabaseList } from "@/services/api/database";
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
import { Download, Trash } from "lucide-react";
import { toast } from "../ui/use-toast";
import { getStationList } from "@/services/api/station";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ReusablePagination } from "../features/pagination";

type Props = {
  cookie: string;
  limit: string;
  page: string;
};

export default function DatabaseTableSection({ cookie, limit, page }: Props) {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const [startDate, setStartDate] = useState<Date>(threeMonthsAgo);
  const [endDate, setEndDate] = useState<Date>(today);
  const [startHour, setStartHour] = useState<Date | undefined>();
  const [endHour, setEndHour] = useState<Date | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [stationFilter, setStationFilter] = useState<string>("all");

  const dateQueryKey =
    startDate && endDate
      ? {
          startDate: format(parseISO(startDate.toISOString()), "yyyy-MM-dd"),
          endDate: format(parseISO(endDate.toISOString()), "yyyy-MM-dd"),
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
    refetchInterval: false,
  });

  const stationQuery = useQuery({
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(cookie);
    },
  });

  const handleResetFilter = () => {
    setStartDate(threeMonthsAgo);
    setEndDate(today);
    setStartHour(undefined);
    setEndHour(undefined);
    setStationFilter("all");
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await exportDatabase({
        cookie,
        startDate,
        endDate,
        startHour,
        endHour,
      });

      const contentDisposition = res.headers["content-disposition"];
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "data.xlsx";

      const blob = new Blob([res?.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
      toast({
        title: "Export Sukses",
        description: "Data Berhasil Diexport",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Export Gagal",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex w-full items-start justify-between">
        <h1 className="text-3xl font-semibold">Integrasi Data Onlimo</h1>
        <div className="flex w-full flex-wrap-reverse items-end justify-end gap-5">
          <LimitPage />
          <Select
            value={stationFilter}
            onValueChange={(value: string) => {
              setStationFilter(value);
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[180px]" data-testid="station-filter">
              <SelectValue placeholder="Pilih Stasiun" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all" defaultChecked>
                  Semua Stasiun
                </SelectItem>
                {stationQuery?.data?.data?.values.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item.nama_stasiun}
                    data-testid={`station-filter-${item.nama_stasiun}`}
                  >
                    {item.nama_stasiun}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExport}
            disabled={loading}
            data-testid="export-excel"
            className="text-slate-50 dark:text-slate-50"
          >
            {loading ? (
              <div
                className="text-surface mr-2 inline-block size-[14px] animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
                data-testid="loading-icon"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-5">
        <div className="flex items-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetFilter}
            data-testid="reset-filter"
          >
            <Trash className="mr-2 h-4 w-4" />
            Clear Filter
          </Button>
        </div>
        <DatePicker
          date={startDate}
          setDate={setStartDate}
          placeholder="Tanggal Awal"
          label="Dari :"
          hour={startHour}
          setHour={setStartHour}
        />
        <DatePicker
          date={endDate}
          setDate={setEndDate}
          placeholder="Tanggal Akhir"
          label="Sampai :"
          hour={endHour}
          setHour={setEndHour}
        />
      </div>
      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {dbQuery?.data?.success && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead className="min-w-[180px]">ID Stasiun</TableHead>
                  <TableHead className="min-w-[150px]">Tanggal</TableHead>
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
                  const { data }: { data: payload } = JSON.parse(item?.payload);
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

            <div className="mt-5">
              <ReusablePagination
                currentPage={parseInt(page)}
                totalData={Number(dbQuery?.data?.totalData)}
                limit={parseInt(limit)}
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
