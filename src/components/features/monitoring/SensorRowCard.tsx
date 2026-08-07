import React from "react";
import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  subLabel: string;
  value: string;
  unit: string;
  Icon: LucideIcon;
  iconClassName: string;
};

export default function SensorRowCard({
  label,
  subLabel,
  value,
  unit,
  Icon,
  iconClassName,
}: Props) {
  return (
    <div className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">{label}</p>
          <p className="text-[10px] text-slate-400">{subLabel}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-black text-slate-800">{value}</p>
        <p className="text-[10px] font-medium text-slate-500">{unit}</p>
      </div>
    </div>
  );
}
