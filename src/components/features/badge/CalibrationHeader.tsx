import React from "react";
import { StatusBadge } from "./StatusBadge";
import { CalibrationStatus } from "@/types/calibration";

interface CalibrationHeaderProps {
  reportNo: string;
  officer: string;
  calibrationDate: string;
  status: CalibrationStatus;
  completionPercentage?: number;
}

export const CalibrationHeader: React.FC<CalibrationHeaderProps> = ({
  reportNo,
  officer,
  calibrationDate,
  status,
  completionPercentage = 0,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calibration Sheet</h1>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-slate-500 mt-1">
          No: <span className="font-semibold text-slate-800">{reportNo || "Draft"}</span> | Officer:{" "}
          <span className="font-semibold text-slate-800">{officer}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>Form Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 text-right">Date: {calibrationDate}</p>
      </div>
    </div>
  );
};
