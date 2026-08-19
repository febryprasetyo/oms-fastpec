"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Background fetch PDF blob dari backend agar tombol Unduh PDF & Cetak PDF langsung responsif
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError(false);

    calibrationService
      .downloadPdf(detail.id, token)
      .then((pdf) => {
        objectUrl = window.URL.createObjectURL(pdf);
        if (active) setPreviewUrl(objectUrl);
      })
      .catch((error) => {
        console.error("Gagal memuat artefak PDF laporan kalibrasi dari backend.", error);
        if (active) setPreviewError(true);
      });

    return () => {
      active = false;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [detail.id, token]);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      let url = previewUrl;
      if (!url) {
        const pdf = await calibrationService.downloadPdf(detail.id, token);
        url = window.URL.createObjectURL(pdf);
        setPreviewUrl(url);
      }

      if (iframeRef.current) {
        if (!iframeRef.current.src || iframeRef.current.src === "" || iframeRef.current.src === window.location.href) {
          iframeRef.current.src = url;
        }
        iframeRef.current.contentWindow?.print();
      }
    } catch (error) {
      console.error("Gagal mencetak PDF laporan kalibrasi dari backend.", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      let url = previewUrl;
      if (!url) {
        const pdf = await calibrationService.downloadPdf(detail.id, token);
        url = window.URL.createObjectURL(pdf);
        setPreviewUrl(url);
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Kalibrasi_${(detail.reportNo || detail.id).replace(/\//g, "_")}.pdf`;
      link.click();
    } catch (error) {
      console.error("Gagal mengunduh PDF laporan kalibrasi dari backend.", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar: Tombol Cetak & Unduh PDF (Keduanya langsung dari backend PDF engine) */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2" disabled={isPrinting}>
          {isPrinting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          <span>Cetak</span>
        </Button>
        <Button onClick={handleDownloadPdf} className="gap-2" disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Unduh PDF</span>
        </Button>
      </div>

      {/* Hidden iframe khusus untuk menjalankan proses print PDF backend resmi tanpa merender UI devtools/halaman browser */}
      <iframe
        ref={iframeRef}
        title="Pratinjau Cetak PDF Backend"
        src={previewUrl || undefined}
        className="hidden print:hidden"
        style={{ display: "none", width: 0, height: 0, position: "absolute", border: "none" }}
      />

      {/* =========================================================================
          [COMMENTED OUT] Render PDF Engine (Puppeteer backend) melalui iframe visual.
          Dinonaktifkan sementara untuk beralih ke Native Frontend Rendering 
          yang instan tanpa overhead/delay render server-side PDF.
          ========================================================================= */}
      {/*
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
      */}

      {/* =========================================================================
          [NATIVE FRONTEND RENDERING]
          Menampilkan dokumen kalibrasi langsung menggunakan komponen React Native 
          dengan layout, font, dan format 1:1 identik dengan template backend
          untuk pratinjau instan di browser.
          ========================================================================= */}
      <CalibrationReportDocument detail={detail} hideIndicator />
    </div>
  );
};
