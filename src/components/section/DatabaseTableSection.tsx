"use client";
import { useState } from "react";
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
import { format, parseISO, subMonths } from "date-fns";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
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
import ExportForm from "../features/export/ExportForm";

type Props = {
  cookie: string;
  limit: string;
  page: string;
};

export default function DatabaseTableSection({ cookie, limit, page }: Props) {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const [startDate, setStartDate] = useState<Date | undefined>(threeMonthsAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [startHour, setStartHour] = useState<Date | undefined>(today);
  const [endHour, setEndHour] = useState<Date | undefined>(today);
  const [stationFilter, setStationFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

          <ExportForm
            token={cookie}
            type="database"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
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
        <div className="w-[280px]">
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Tanggal Awal"
            label="Dari :"
            hour={startHour}
            setHour={setStartHour}
          />
        </div>
        <div className="w-[280px]">
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            placeholder="Tanggal Akhir"
            label="Sampai :"
            hour={endHour}
            setHour={setEndHour}
          />
        </div>
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
