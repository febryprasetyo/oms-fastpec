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
import { Dispatch } from "react";
import { Label } from "@radix-ui/react-label";

type Props = {
  date: Date;
  setDate: Dispatch<Date>;
  label: string;
  placeholder: string;
};

export function DatePicker({ date, setDate, label, placeholder }: Props) {
  return (
    <Popover>
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start border-none bg-white text-left font-normal text-slate-950 shadow-sm hover:bg-slate-950 hover:text-white dark:bg-darkSecondary dark:text-slate-50 dark:hover:bg-dark_accent",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => day && setDate(day)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
