import React from "react";
import { translateCalibrationStatus } from "@/lib/calibration-format";
import { CalibrationStatus } from "@/types/calibration";

interface StatusBadgeProps {
  status: CalibrationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: CalibrationStatus) => {
    switch (status) {
      case "Approved":
        return "text-emerald-700 font-bold";
      case "Submitted":
        return "text-blue-700 font-bold";
      case "Draft":
      default:
        return "text-amber-700 font-bold";
    }
  };

  return (
    <span className={`inline-flex items-center text-xs sm:text-sm capitalize ${getStatusColor(status)}`}>
      {translateCalibrationStatus(status)}
    </span>
  );
};
