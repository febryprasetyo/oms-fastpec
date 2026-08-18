"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCalibrationAuth } from "@/hook/useCalibration";
import { calibrationService } from "@/services/api/calibration";
import type { CalibrationDetail } from "@/types/calibration";

interface ReportPreviewProps {
  detail: CalibrationDetail;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ detail }) => {
  const { token } = useCalibrationAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    let active = true;
    setPreviewHtml(null);
    setPreviewError(false);

    calibrationService.getReportPreviewHtml(detail.id, token)
      .then((html) => {
        if (active) setPreviewHtml(html);
      })
      .catch((error) => {
        console.error("Gagal memuat pratinjau laporan kalibrasi.", error);
        if (active) setPreviewError(true);
      });

    return () => {
      active = false;
    };
  }, [detail.id, token]);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await calibrationService.downloadPdf(detail.id, token);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Laporan_Kalibrasi_${detail.reportNo.replace(/\//g, "_")}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Gagal mengunduh PDF laporan kalibrasi.", error);
      toast.error("PDF laporan kalibrasi gagal diunduh.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2" disabled={!previewHtml}>
          <Printer className="h-4 w-4" />
          <span>Cetak</span>
        </Button>
        <Button onClick={handleDownloadPdf} className="gap-2">
          <Download className="h-4 w-4" />
          <span>Unduh PDF</span>
        </Button>
      </div>

      {!previewHtml && !previewError && (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Memuat pratinjau laporan kalibrasi...
        </div>
      )}

      {previewError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          Pratinjau laporan kalibrasi gagal dimuat.
        </div>
      )}

      {previewHtml && (
        <iframe
          ref={iframeRef}
          title="Pratinjau laporan kalibrasi"
          srcDoc={previewHtml}
          sandbox="allow-same-origin allow-modals"
          className="mx-auto min-h-[1123px] w-full max-w-[794px] border border-slate-200 bg-white shadow-sm"
        />
      )}
    </div>
  );
};
