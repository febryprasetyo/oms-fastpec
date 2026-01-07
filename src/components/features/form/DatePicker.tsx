"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dispatch, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { TimePicker } from "./TimePicker";

type Props = {
  date: Date | undefined;
  setDate: Dispatch<Date | undefined>;
  label?: string;
  placeholder: string;
  hour?: Date | undefined;
  setHour?: Dispatch<Date | undefined>;
  withTime?: boolean;
  disabledDate?: (date: Date) => boolean;
  className?: string;
};

export function DatePicker({
  date,
  setDate,
  label,
  placeholder,
  hour,
  setHour,
  withTime = true,
  disabledDate,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open}>
      <div className="flex flex-col gap-1.5 w-full">
        {label && <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</Label>}

        <PopoverTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant={"outline"}
            className={cn(
              "w-full justify-start h-11 rounded-xl bg-white text-left font-medium text-slate-700 dark:bg-darkSecondary dark:text-slate-200 border-slate-200 dark:border-dark_accent hover:bg-slate-50 dark:hover:bg-dark_accent/50",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
            {date ? format(date, "PPP") : <span className="text-slate-400">{placeholder}</span>}
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        className=" w-auto p-0"
        onFocusOutside={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => {
            setDate(day);
            setOpen(false);
          }}
          initialFocus
          disabled={disabledDate}
        />

        {withTime && (
          <>
            <hr />
            <div className="p-3">
              <TimePicker date={hour} setDate={setHour || (() => {})} />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
