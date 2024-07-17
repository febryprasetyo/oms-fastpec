"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { exportDatabase } from "@/services/api/database";
import ReactPaginate from "react-paginate";
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
import { getHistoryList } from "@/services/api/history";

type Props = {
  cookie: string;
};

export default function HistorySection({ cookie }: Props) {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [itemsPerPage, setItemPerPage] = useState<number>(10);
  const [startDate, setStartDate] = useState<Date>(threeMonthsAgo);
  const [endDate, setEndDate] = useState<Date>(today);
  const [startHour, setStartHour] = useState<Date | undefined>();
  const [endHour, setEndHour] = useState<Date | undefined>();
  const endOffset = itemOffset + itemsPerPage;
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

  const stationKey = stationFilter ? { stationFilter } : null;

  const dbQuery = useQuery({
    queryKey: ["history", dateQueryKey, hourQueryKey, stationKey],
    queryFn: () => {
      return getHistoryList({
        cookie,
        startHour,
        endHour,
        startDate,
        endDate,
        stationFilter,
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

  const currentItems = dbQuery?.data?.data.slice(itemOffset, endOffset);
  const pageCount = Math.ceil((dbQuery?.data?.data.length ?? 0) / itemsPerPage);
  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) % (dbQuery?.data?.data.length ?? 0);
    setItemOffset(newOffset);
  };

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
        <h1 className="text-3xl font-semibold">History</h1>
        <div className="flex w-full flex-wrap-reverse items-end justify-end gap-5">
          <LimitPage
            itemsPerPage={itemsPerPage}
            setItemPerPage={setItemPerPage}
          />
          <Select
            value={stationFilter}
            onValueChange={(value: string) => {
              setStationFilter(value);
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Stasiun" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all" defaultChecked>
                  Semua Stasiun
                </SelectItem>
                {stationQuery?.data?.data?.values.map((item, index) => (
                  <SelectItem key={index} value={item.nama_stasiun}>
                    {item.nama_stasiun}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <div
                className="text-surface mr-2 inline-block size-[14px] animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
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
          <Button variant="destructive" size="sm" onClick={handleResetFilter}>
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
                  <TableHead className="min-w-[180px]">Nama Stasiun</TableHead>
                  <TableHead className="min-w-[150px]">Tanggal</TableHead>
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
                  <TableHead>Lgnh4+</TableHead>
                  <TableHead>Liquid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.nama_stasiun}</TableCell>
                    <TableCell>{format(item.time, "yyyy-MM-dd")}</TableCell>
                    <TableCell>{format(item.time, "HH:mm")}</TableCell>
                    <TableCell>{item.temperature}</TableCell>
                    <TableCell>{item.do_}</TableCell>
                    <TableCell>{item.tur}</TableCell>
                    <TableCell>{item.ct}</TableCell>
                    <TableCell>{item.ph}</TableCell>
                    <TableCell>{item.orp}</TableCell>
                    <TableCell>{item.bod}</TableCell>
                    <TableCell>{item.cod}</TableCell>
                    <TableCell>{item.tss}</TableCell>
                    <TableCell>{item.n}</TableCell>
                    <TableCell>{item.no3_3}</TableCell>
                    <TableCell>{item.no2}</TableCell>
                    <TableCell>{item.depth}</TableCell>
                    <TableCell>{item.lgnh4_plus || "-"}</TableCell>
                    <TableCell>{item.liquid || "-"}</TableCell>
                  </TableRow>
                )) ?? <></>}
              </TableBody>
            </Table>
            <div className="overflow-auto " id="pagination">
              <ReactPaginate
                breakLabel="..."
                nextLabel=" >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel="<"
                renderOnZeroPageCount={null}
                breakClassName="text-xl"
                className=" mt-5 flex items-center justify-center gap-3 py-2"
                activeClassName="bg-primary text-white dark:bg-primary dark:text-white flex items-center justify-center rounded-lg text-lg"
                pageLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
                nextLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
                previousLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
                disabledLinkClassName="text-gray-400 dark:text-gray-400 size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent cursor-not-allowed hover:bg-transparent hover:text-gray-400 dark:hover:text-gray-400 dark:hover:bg-transparent"
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
