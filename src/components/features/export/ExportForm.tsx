import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { exportDatabase } from "@/services/api/database";
import { Download } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePicker } from "../form/DatePicker";
import { TimePicker } from "../form/TimePicker";
import { exportHistory } from "@/services/api/history";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  type: "database" | "history";
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  token: string;
  stationFilter?: string;
  stationList?: StationTableData[];
};

export default function ExportForm({ type, isOpen, setIsOpen, token, stationFilter, stationList }: Props) {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedStation, setSelectedStation] = useState<string>(stationFilter || "all");
  
  // Set default time to cover full day: 00:00:00 to 23:59:59
  const defaultStartTime = new Date();
  defaultStartTime.setHours(0, 0, 0, 0);
  
  const defaultEndTime = new Date();
  defaultEndTime.setHours(23, 59, 59, 999);
  
  const [startHour, setStartHour] = useState<Date | undefined>(defaultStartTime);
  const [endHour, setEndHour] = useState<Date | undefined>(defaultEndTime);
  const [isSubmitable, setIsSubmitable] = useState(false);

  const setQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  const handleExport = async () => {
    setLoading(true);
    const getExport = async (type: "database" | "history") => {
      if (type === "database") {
        return exportDatabase({
          cookie: token,
          startDate,
          endDate,
          startHour,
          endHour,
          stationFilter: selectedStation,
        });
      } else {
        return exportHistory({
          cookie: token,
          startDate,
          endDate,
          startHour,
          endHour,
          stationFilter: selectedStation,
        });
      }
    };
    try {
      const res = await getExport(type);
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
          variant: "destructive",
          title: "Export Gagal",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
      setIsOpen(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setStartHour(defaultStartTime);
      setEndHour(defaultEndTime);
    }
  };

  // Removed useEffect that clears endDate when startDate changes to allow quick filters to work better
  // useEffect(() => {
  //   setEndDate(undefined);
  // }, [startDate]);

  useEffect(() => {
    // Only require dates to be selected, time has default values
    if (startDate && endDate) {
      setIsSubmitable(true);
    } else {
      setIsSubmitable(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (isOpen) {
      setSelectedStation(stationFilter || "all");
    }
  }, [isOpen, stationFilter]);

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>
        <Button
          data-testid="export-excel"
          className="text-slate-50 dark:text-slate-50"
          onClick={() => setIsOpen(true)}
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
      </DialogTrigger>
      <DialogContent className="overflow-visible">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Isi form di bawah ini untuk mengekspor data{" "}
            {type === "database" ? "database" : "history"}.
            <br />
            <span className="text-xs text-muted-foreground">
              Waktu otomatis diset 00:00:00 - 23:59:59 untuk mengunduh data 1 hari penuh. 
              Maksimal export 31 hari.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {stationList && stationList.length > 1 && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Pilih Stasiun :</Label>
              <Select
                value={selectedStation}
                onValueChange={(value) => setSelectedStation(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Stasiun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Semua Stasiun</SelectItem>
                    {stationList.map((station) => (
                      <SelectItem key={station.id} value={station.nama_stasiun}>
                        {station.nama_stasiun}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quick Filter Presets */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Quick Filter :</Label>
            <div className="flex items-center gap-2">
              {[1, 7, 30].map((days) => (
                <Button
                  key={days}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3 rounded-full border-slate-200 text-slate-900 dark:text-slate-300 font-medium hover:bg-primary hover:text-white transition-all shadow-sm"
                  onClick={() => setQuickFilter(days)}
                >
                  {days === 1 ? "1 Day" : `${days} Days`}
                </Button>
              ))}
            </div>
          </div>
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Pilih Tanggal Awal"
            label="Tanggal Awal :"
            withTime={false}
          />
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            placeholder="Pilih Tanggal Akhir"
            label="Tanggal Akhir :"
            withTime={false}
            disabledDate={(date) => {
              return startDate
                ? date < startDate ||
                    date.getTime() - startDate.getTime() >
                      30 * 24 * 60 * 60 * 1000
                : false;
            }}
          />

          {/* Jam Awal and Jam Akhir removed per user request, but state is kept for backend defaults */}
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => {
              setIsOpen(false);
              setStartDate(undefined);
              setEndDate(undefined);
              setStartHour(defaultStartTime);
              setEndHour(defaultEndTime);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!isSubmitable || loading}
            onClick={() => {
              handleExport();
            }}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
