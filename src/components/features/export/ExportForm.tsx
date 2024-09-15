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

type Props = {
  type: "database" | "history";
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  token: string;
};

export default function ExportForm({ type, isOpen, setIsOpen, token }: Props) {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startHour, setStartHour] = useState<Date | undefined>(undefined);
  const [endHour, setEndHour] = useState<Date | undefined>(undefined);
  const [isSubmitable, setIsSubmitable] = useState(false);

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
        });
      } else {
        return exportHistory({
          cookie: token,
          startDate,
          endDate,
          startHour,
          endHour,
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
      setStartHour(undefined);
      setEndHour(undefined);
    }
  };

  useEffect(() => {
    setEndDate(undefined);
  }, [startDate]);

  useEffect(() => {
    if (startDate && endDate && startHour && endHour) {
      setIsSubmitable(true);
    } else {
      setIsSubmitable(false);
    }
  }, [startDate, endDate, startHour, endHour]);

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
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Jam Awal :</Label>

            <TimePicker date={startHour} setDate={setStartHour} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Jam Akhir :</Label>

            <TimePicker date={endHour} setDate={setEndHour} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => {
              setIsOpen(false);
              setStartDate(undefined);
              setEndDate(undefined);
              setStartHour(undefined);
              setEndHour(undefined);
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
