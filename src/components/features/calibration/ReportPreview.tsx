"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError(false);

    calibrationService.downloadPdf(detail.id, token)
      .then((pdf) => {
        objectUrl = window.URL.createObjectURL(pdf);
        if (active) setPreviewUrl(objectUrl);
      })
      .catch((error) => {
        console.error("Gagal memuat pratinjau laporan kalibrasi.", error);
        if (active) setPreviewError(true);
      });

    return () => {
      active = false;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [detail.id, token]);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  const handleDownloadPdf = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `Laporan_Kalibrasi_${detail.reportNo.replace(/\//g, "_")}.pdf`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2" disabled={!previewUrl}>
          <Printer className="h-4 w-4" />
          <span>Cetak</span>
        </Button>
        <Button onClick={handleDownloadPdf} className="gap-2" disabled={!previewUrl}>
          <Download className="h-4 w-4" />
          <span>Unduh PDF</span>
        </Button>
      </div>

      {!previewUrl && !previewError && (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Memuat pratinjau laporan kalibrasi...
        </div>
      )}

      {previewError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          Pratinjau laporan kalibrasi gagal dimuat.
        </div>
      )}

      {previewUrl && (
        <iframe
          ref={iframeRef}
          title="Pratinjau laporan kalibrasi"
          src={previewUrl}
          className="mx-auto min-h-[1123px] w-full max-w-[794px] border border-slate-200 bg-white shadow-sm"
        />
      )}
    </div>
  );
};
