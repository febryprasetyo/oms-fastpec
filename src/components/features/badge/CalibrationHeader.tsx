import React from "react";
import { StatusBadge } from "./StatusBadge";
import { formatCalibrationDateRange } from "@/lib/calibration-format";
import { CalibrationStatus } from "@/types/calibration";

interface CalibrationHeaderProps {
  reportNo: string;
  officer: string;
  calibrationStartDate: string;
  calibrationEndDate: string;
  status: CalibrationStatus;
  completionPercentage?: number;
}

export const CalibrationHeader: React.FC<CalibrationHeaderProps> = ({
  reportNo,
  officer,
  calibrationStartDate,
  calibrationEndDate,
  status,
  completionPercentage = 0,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4 mb-4 sm:mb-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Lembar Kalibrasi</h1>
          <StatusBadge status={status} />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-1.5">
          <span>Nomor Laporan:</span>
          <span className="font-semibold text-slate-800">{reportNo || "Draf"}</span>
          <span className="hidden sm:inline">•</span>
          <span>Petugas:</span>
          <span className="font-semibold text-slate-800">{officer}</span>
        </p>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-64 shrink-0 bg-slate-50/80 p-3 rounded-xl border border-slate-100 md:bg-transparent md:p-0 md:border-none">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Kelengkapan Formulir</span>
          <span className="text-blue-600 font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 text-left md:text-right">
          Tanggal: {formatCalibrationDateRange(calibrationStartDate, calibrationEndDate)}
        </p>
      </div>
    </div>
  );
};
