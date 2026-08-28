"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCalibrationAuth } from "@/hook/useCalibration";
import { calibrationService } from "@/services/api/calibration";
import type { CalibrationDetail } from "@/types/calibration";
import { CalibrationReportDocument } from "./CalibrationReportDocument";

interface ReportPreviewProps {
  detail: CalibrationDetail;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ detail }) => {
  const { token } = useCalibrationAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const pdf = await calibrationService.downloadPdf(detail.id, token);
      const url = window.URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Kalibrasi_${(detail.reportNo || detail.id).replace(/\//g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.success("File PDF laporan kalibrasi berhasil diunduh.");
    } catch (error) {
      console.error("Gagal mengunduh PDF laporan kalibrasi dari backend.", error);
      toast.error(
        "Gagal mengunduh file PDF dari server. Anda juga dapat menggunakan tombol Cetak -> Simpan sebagai PDF.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar: Tombol Cetak & Unduh PDF */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          <span>Cetak</span>
        </Button>
        <Button
          onClick={handleDownloadPdf}
          className="gap-2"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{isDownloading ? "Mengunduh..." : "Unduh PDF"}</span>
        </Button>
      </div>

      {/* Tampilan Dokumen Kalibrasi Native Frontend */}
      <CalibrationReportDocument detail={detail} hideIndicator />
    </div>
  );
};
