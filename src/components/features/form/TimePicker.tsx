"use client";

import { Label } from "@/components/ui/label";
import { TimePickerInput } from "./TimePickerInput";
import { useRef } from "react";

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label: string;
}

export function TimePicker({ date, setDate, label }: TimePickerDemoProps) {
  const minuteRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col justify-end gap-3 ">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="grid gap-1 text-center">
          <TimePickerInput
            picker="hours"
            date={date}
            setDate={setDate}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
        </div>
        <div className="grid gap-1 text-center">
          <TimePickerInput
            picker="minutes"
            date={date}
            setDate={setDate}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
          />
        </div>
      </div>
    </div>
  );
}
