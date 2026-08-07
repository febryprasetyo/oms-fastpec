import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalibrationStatus } from "@/types/calibration";

interface StatusBadgeProps {
  status: CalibrationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (status: CalibrationStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
      case "Submitted":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
      case "Draft":
      default:
        return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100";
    }
  };

  return (
    <Badge variant="outline" className={`font-semibold capitalize px-2.5 py-0.5 ${getBadgeStyle(status)}`}>
      {status}
    </Badge>
  );
};
