"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useCalibrationDetail, useApproveCalibration, useCalibrationAuth } from "@/hook/useCalibration";
import { ReportPreview } from "@/components/features/calibration/ReportPreview";
import { QRCodeCard } from "@/components/features/calibration/QRCodeCard";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { CalibrationDetailSkeleton } from "@/components/features/calibration/CalibrationSkeleton";

export default function CalibrationDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: detail, isLoading } = useCalibrationDetail(id);
  const approveMutation = useApproveCalibration();
  const { role } = useCalibrationAuth();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Calibration report approved!");
    } catch {
      toast.error("Failed to approve calibration report");
    }
  };

  if (isLoading) {
    return <CalibrationDetailSkeleton />;
  }

  if (!detail) {
    return <div className="p-8 text-center text-red-500">Calibration report not found.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Report Preview */}
        <div className="flex-1 w-full">
          <ReportPreview detail={detail} />
        </div>

        {/* Info & Side Panel (Hidden on print) */}
        <div className="w-full md:w-auto space-y-4 shrink-0 print:hidden">
          {detail.uuid && <QRCodeCard uuid={detail.uuid} />}

          {role === "ADMIN" && detail.status === "Submitted" && (
            <Button onClick={handleApprove} className="w-full gap-2 text-white bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Approve Calibration</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
