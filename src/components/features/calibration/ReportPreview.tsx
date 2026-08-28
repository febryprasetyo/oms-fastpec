"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCalibrationAuth } from "@/hook/useCalibration";
import { calibrationService } from "@/services/api/calibration";
import type { CalibrationDetail } from "@/types/calibration";
import {
  CalibrationReportDocument,
  printCalibrationReport,
} from "./CalibrationReportDocument";

interface ReportPreviewProps {
  detail: CalibrationDetail;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ detail }) => {
  const { token } = useCalibrationAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const pdf = await calibrationService.downloadPdf(detail.id, token);
      const blobUrl = window.URL.createObjectURL(
        new Blob([pdf], { type: "application/pdf" })
      );

      // Remove existing PDF print frame if present
      const existingFrame = document.getElementById("calibration-pdf-print-frame");
      if (existingFrame) {
        existingFrame.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "calibration-pdf-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      let printed = false;
      const triggerPrint = () => {
        if (printed) return;
        printed = true;
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.open(blobUrl, "_blank");
        } finally {
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
            iframe.remove();
          }, 60000);
        }
      };

      iframe.onload = () => setTimeout(triggerPrint, 50);
      setTimeout(triggerPrint, 150);
    } catch (error) {
      console.error("Gagal mengambil PDF backend, fallback ke cetak native", error);
      toast.error(
        "Gagal memuat dokumen PDF server. Menggunakan cetak pratinjau browser."
      );
      printCalibrationReport();
    } finally {
      setIsPrinting(false);
    }
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
        <Button
          onClick={handlePrint}
          variant="outline"
          className="gap-2"
          disabled={isPrinting || isDownloading}
        >
          {isPrinting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          <span>{isPrinting ? "Menyiapkan..." : "Cetak"}</span>
        </Button>
        <Button
          onClick={handleDownloadPdf}
          className="gap-2"
          disabled={isPrinting || isDownloading}
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
