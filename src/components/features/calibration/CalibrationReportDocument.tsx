"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deriveCalibrationDetailStatus,
  formatCalibrationDate,
  formatCalibrationDateRange,
  formatCalibrationMeasurement,
  formatCalibrationCoefficient,
  formatCalibrationParameterName,
  formatCalibrationPlace,
  formatCalibrationStandard,
} from "@/lib/calibration-format";
import { sanitizeCalibrationNotes } from "@/lib/calibration-notes";
import type {
  CalibrationDetail,
  ParameterCalibrationDetail,
  WaterSample,
} from "@/types/calibration";

interface CalibrationReportDocumentProps {
  detail: CalibrationDetail;
  hideIndicator?: boolean;
}

type WaterSampleColumnDef = {
  key: string;
  label: string;
  unit: string;
  paramNames: string[];
  getter: (sample: WaterSample) => string | number | null | undefined;
};

const WATER_SAMPLE_COLUMNS: WaterSampleColumnDef[] = [
  {
    key: "suhu",
    label: "Suhu",
    unit: "(°C)",
    paramNames: ["suhu", "temperature"],
    getter: (s: any) => s.temperature ?? s.suhu,
  },
  {
    key: "do",
    label: "DO",
    unit: "(mg/L)",
    paramNames: ["do", "dissolved oxygen"],
    getter: (s: any) => s.doValue ?? s.do,
  },
  {
    key: "tds",
    label: "TDS",
    unit: "(mg/L)",
    paramNames: ["tds", "total dissolved solids"],
    getter: (s: any) => s.tds,
  },
  {
    key: "tur",
    label: "Turbiditas",
    unit: "(NTU)",
    paramNames: ["tur", "turbidity", "kekeruhan", "turbiditas"],
    getter: (s: any) => s.turbidity ?? s.tur,
  },
  {
    key: "ph",
    label: "pH",
    unit: "Satuan",
    paramNames: ["ph"],
    getter: (s: any) => s.ph,
  },
  {
    key: "orp",
    label: "ORP",
    unit: "(mV)",
    paramNames: ["orp"],
    getter: (s: any) => s.orp,
  },
  {
    key: "cod",
    label: "COD",
    unit: "(mg/L)",
    paramNames: ["cod"],
    getter: (s: any) => s.cod,
  },
  {
    key: "bod",
    label: "BOD",
    unit: "(mg/L)",
    paramNames: ["bod"],
    getter: (s: any) => s.bod,
  },
  {
    key: "tss",
    label: "TSS",
    unit: "(mg/L)",
    paramNames: ["tss"],
    getter: (s: any) => s.tss,
  },
  {
    key: "amonia",
    label: "Amonia",
    unit: "(mg/L)",
    paramNames: ["amonia", "nh3", "nh3-n", "amonia (nh3-n)"],
    getter: (s: any) => s.nh3 ?? s.amonia,
  },
  {
    key: "nitrat",
    label: "Nitrat",
    unit: "(mg/L)",
    paramNames: ["nitrat", "no3", "no3-n", "nitrat (no3-n)"],
    getter: (s: any) => s.no3 ?? s.nitrat,
  },
  {
    key: "nitrit",
    label: "Nitrit",
    unit: "(mg/L)",
    paramNames: ["nitrit", "no2", "no2-n", "nitrit (no2-n)"],
    getter: (s: any) => s.no2 ?? s.nitrit,
  },
  {
    key: "depth",
    label: "Kedalaman",
    unit: "(m)",
    paramNames: ["kedalaman", "depth", "level"],
    getter: (s: any) => s.depth ?? s.kedalaman,
  },
];

function formatCoefficients(param: ParameterCalibrationDetail): React.ReactNode {
  if (!param.coefficients || param.coefficients.length === 0) {
    return <span>-</span>;
  }

  const isPh = param.parameterName.trim().toLowerCase() === "ph";

  if (isPh) {
    const coeffMap = new Map(
      param.coefficients.map((c) => [c.key.toLowerCase(), c.value]),
    );
    const pairs = [
      ["k1", "k2"],
      ["k3", "k4"],
      ["k5", "k6"],
    ];

    return (
      <div className="space-y-0.5 text-center text-[8pt]">
        {pairs.map(([kLeft, kRight], idx) => {
          const vLeft = coeffMap.get(kLeft);
          const vRight = coeffMap.get(kRight);
          const parts: string[] = [];
          if (vLeft !== undefined)
            parts.push(`${kLeft.toUpperCase()}: ${formatCalibrationCoefficient(vLeft)}`);
          if (vRight !== undefined)
            parts.push(`${kRight.toUpperCase()}: ${formatCalibrationCoefficient(vRight)}`);
          if (parts.length === 0) return null;
          return <div key={idx}>{parts.join(" | ")}</div>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-0.5 text-center text-[8pt]">
      {param.coefficients.map((c, idx) => (
        <div key={idx}>
          <strong>{c.key.toUpperCase()}:</strong>{" "}
          {c.value !== undefined ? formatCalibrationCoefficient(c.value) : "-"}
        </div>
      ))}
    </div>
  );
}

const REPORT_EMBEDDED_STYLES = `
  #calibration-native-report {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 8.5pt;
    line-height: 1.35;
    color: #1a202c;
    background: #fff;
  }
  #calibration-native-report * {
    box-sizing: border-box;
  }
  #calibration-native-report table {
    width: 100%;
    border-collapse: collapse;
  }
  #calibration-native-report .header-table {
    border-bottom: 2px solid #0f2942;
    margin-bottom: 10px;
    width: 100%;
  }
  #calibration-native-report .header-table td,
  #calibration-native-report .station-table td,
  #calibration-native-report .cal-table th,
  #calibration-native-report .cal-table td,
  #calibration-native-report .sample-table th,
  #calibration-native-report .sample-table td,
  #calibration-native-report .sig-table td {
    vertical-align: top;
  }
  #calibration-native-report .header-table td {
    padding-bottom: 6px;
  }
  #calibration-native-report .company-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  #calibration-native-report .company-logo {
    width: 62px;
    height: 62px;
    display: block;
    flex: 0 0 62px;
  }
  #calibration-native-report .company-name {
    font-size: 13pt;
    font-weight: 700;
    color: #0f2942;
    text-transform: uppercase;
    letter-spacing: .5px;
  }
  #calibration-native-report .company-info {
    font-size: 7.5pt;
    color: #334155;
    line-height: 1.25;
  }
  #calibration-native-report .doc-main-title {
    text-align: right;
    font-size: 14pt;
    font-weight: 700;
    color: #1e3a8a;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  #calibration-native-report .doc-no-title {
    text-align: right;
    font-size: 8.5pt;
    font-weight: 700;
    color: #475569;
    margin-top: 3px;
  }
  #calibration-native-report .station-table {
    margin-bottom: 8px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    width: 100%;
  }
  #calibration-native-report .station-table td {
    padding: 4px 8px;
    font-size: 8.5pt;
    vertical-align: middle;
  }
  #calibration-native-report .st-label {
    font-weight: 700;
    color: #1e293b;
    width: 18%;
  }
  #calibration-native-report .st-val {
    color: #0f172a;
    width: 32%;
  }
  #calibration-native-report .section-header {
    background: #0f2942 !important;
    color: #ffffff !important;
    font-weight: 700;
    font-size: 9pt;
    padding: 4px 8px;
    margin: 8px 0 5px;
    text-transform: uppercase;
    letter-spacing: .5px;
  }
  #calibration-native-report .cal-table,
  #calibration-native-report .sample-table {
    margin-bottom: 8px;
    font-size: 8pt;
    width: 100%;
  }
  #calibration-native-report .sample-table {
    font-size: 5.8pt;
    table-layout: fixed;
  }
  #calibration-native-report .sample-table .sample-name-col {
    width: 15%;
  }
  #calibration-native-report .sample-table th,
  #calibration-native-report .sample-table td {
    overflow-wrap: normal;
    word-break: normal;
    white-space: nowrap;
  }
  #calibration-native-report .sample-table .header-label,
  #calibration-native-report .sample-table .header-unit {
    display: block;
    white-space: nowrap;
  }
  #calibration-native-report .cal-table th,
  #calibration-native-report .sample-table th {
    text-align: center;
    padding: 4px;
    border: 1px solid #cbd5e1;
    font-weight: 700;
  }
  #calibration-native-report .cal-table th {
    background: #f1f5f9 !important;
    color: #0f2942 !important;
  }
  #calibration-native-report .sample-table th {
    background: #1e3a8a !important;
    color: #ffffff !important;
    padding: 4px 2px;
    border-color: #1e3a8a !important;
  }
  #calibration-native-report .cal-table td,
  #calibration-native-report .sample-table td {
    padding: 3.5px 5px;
    border: 1px solid #cbd5e1;
    text-align: center;
    vertical-align: middle;
  }
  #calibration-native-report .sample-table td {
    padding: 3.5px 1px;
  }
  #calibration-native-report .sample-table td:first-child {
    white-space: normal;
    text-align: left;
    font-weight: 700;
  }
  #calibration-native-report .tag-pass {
    color: #0f172a;
    font-weight: 700;
  }
  #calibration-native-report .tag-fail {
    color: #0f172a;
    font-weight: 700;
  }
  #calibration-native-report .tag-pending {
    color: #0f172a;
    font-weight: 500;
  }
  #calibration-native-report .notes-box {
    border: 1px solid #cbd5e1;
    background: #fafafa;
    padding: 5px 8px;
    font-size: 8pt;
    margin-bottom: 8px;
  }
  #calibration-native-report .notes-box ul,
  #calibration-native-report .notes-box ol {
    margin: 2px 0 2px 15px;
    padding: 0;
  }
  #calibration-native-report .notes-box li,
  #calibration-native-report .notes-box p {
    margin-top: 0;
    margin-bottom: 1px;
    line-height: 1.2;
  }
  #calibration-native-report .sig-table {
    margin-top: 8px;
    page-break-inside: avoid;
    break-inside: avoid;
    width: 100%;
  }
  #calibration-native-report .sig-table td {
    width: 50%;
    text-align: left;
    font-size: 8.5pt;
  }
  #calibration-native-report .sig-space {
    width: 93px;
    height: 93px;
    margin: 6px 0;
    border: 1px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #fff;
  }
  #calibration-native-report .sig-space img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  #calibration-native-report .sig-name {
    font-weight: 700;
    text-decoration: underline;
    color: #0f172a;
  }
  #calibration-native-report .sig-sub {
    color: #64748b;
    font-size: 8pt;
  }
  #calibration-native-report .footer-rev {
    margin-top: 10px;
    padding-top: 4px;
    border-top: 1px solid #cbd5e1;
    font-size: 8pt;
    color: #475569;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
  }
  #calibration-native-report .attachment-section {
    page-break-before: always;
    break-before: page;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px dashed #cbd5e1;
  }
  #calibration-native-report .doc-param-item {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 4px;
  }
  #calibration-native-report .doc-param-title {
    font-weight: 700;
    font-size: 8.5pt;
    color: #0f2942;
    background: #ffffff;
    padding: 4px 8px;
    margin-bottom: 8px;
    border-left: 3px solid #1e3a8a;
    border-bottom: 1px solid #e2e8f0;
  }
  #calibration-native-report .doc-grid {
    display: flex;
    gap: 12px;
  }
  #calibration-native-report .doc-col {
    flex: 1;
    width: 50%;
  }
  #calibration-native-report .doc-slot-label {
    font-size: 7.5pt;
    font-weight: 700;
    color: #334155;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  #calibration-native-report .doc-photo-box {
    width: 100%;
    height: 180px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 2px;
  }
  #calibration-native-report .doc-photo-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
    background: #ffffff;
  }
  #calibration-native-report .doc-no-photo-box {
    width: 100%;
    height: 180px;
    border: 1px dashed #cbd5e1;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 7.5pt;
    font-style: italic;
    border-radius: 2px;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body * {
      visibility: hidden;
    }
    #calibration-native-report,
    #calibration-native-report * {
      visibility: visible;
    }
    #calibration-native-report {
      position: absolute;
      left: 0;
      top: 0;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      background: #ffffff !important;
    }
    #calibration-native-report .attachment-section {
      page-break-before: always !important;
      break-before: page !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
      border-top: none !important;
    }
  }
`;

export function printCalibrationReport(elementId = "calibration-native-report") {
  if (typeof window === "undefined") return;

  const reportElement = document.getElementById(elementId);
  if (!reportElement) {
    window.print();
    return;
  }

  // Remove existing print frame if present
  const existingFrame = document.getElementById("calibration-print-frame");
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "calibration-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan Kalibrasi</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    ${REPORT_EMBEDDED_STYLES}
    #calibration-native-report {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      background: #ffffff !important;
    }
  </style>
</head>
<body>
  <div id="calibration-native-report">
    ${reportElement.innerHTML}
  </div>
</body>
</html>`);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    }
  };

  if (doc.readyState === "complete") {
    setTimeout(triggerPrint, 50);
  } else {
    iframe.onload = () => setTimeout(triggerPrint, 50);
  }
}

export const CalibrationReportDocument: React.FC<CalibrationReportDocumentProps> = ({
  detail,
  hideIndicator = false,
}) => {
  const formattedDateRange = formatCalibrationDateRange(
    detail.calibrationStartDate,
    detail.calibrationEndDate,
  );

  const place = formatCalibrationPlace(
    detail.stationCity || detail.address || "",
  );
  const formattedEndDate = formatCalibrationDate(detail.calibrationEndDate);
  const placeDate = place ? `${place}, ${formattedEndDate}` : formattedEndDate;

  // Filter sample table columns matching selected parameters
  const selectedParamNames = new Set(
    detail.parameters.map((p) => p.parameterName.trim().toLowerCase()),
  );
  const activeSampleColumns = WATER_SAMPLE_COLUMNS.filter((col) =>
    col.paramNames.some((name) => selectedParamNames.has(name)),
  );

  const sanitizedNotesHtml = detail.notes
    ? sanitizeCalibrationNotes(detail.notes)
    : "<ul><li>Tidak ada catatan.</li></ul>";

  const handlePrint = () => {
    printCalibrationReport();
  };

  return (
    <div className="space-y-4">
      {/* Embedded CSS that guarantees 100% 1:1 fidelity with Calibration_Report.css */}
      <style dangerouslySetInnerHTML={{ __html: REPORT_EMBEDDED_STYLES }} />

      {/* Action Header / Document Indicator */}
      {!hideIndicator && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 print:hidden">
          <div>
            <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200">
              Pratinjau Dokumen Frontend (Native Render)
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Tampilan dokumen resmi kalibrasi yang dirender langsung di browser tanpa ketergantungan PDF engine.
            </p>
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2 bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Dokumen</span>
          </Button>
        </div>
      )}

      {/* Main Document Paper (A4 Style) */}
      <div
        id="calibration-native-report"
        className="mx-auto w-full max-w-[794px] rounded-xl border border-slate-300 bg-white p-6 sm:p-10 shadow-lg print:border-none print:p-0 print:shadow-none"
      >
        {/* ================= HALAMAN 1: LAPORAN KALIBRASI ================= */}
        <section>
          {/* Header Table */}
          <table className="header-table">
            <tbody>
              <tr>
                <td style={{ width: "55%" }}>
                  <div className="company-header">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="company-logo"
                      src="https://uploads.onecompiler.io/44724abkh/1786077498764/icon-cmc.png"
                      alt="Logo PT Cahaya Mas Cemerlang"
                    />
                    <div>
                      <div className="company-name">PT Cahaya Mas Cemerlang</div>
                      <div className="company-info">
                        <strong>Kantor:</strong> Komplek Majapahit Permai Blok A No.110 &amp; C No.105, Jl. Majapahit No.18-20-22, Jakarta Pusat 10160<br />
                        <strong>Pabrik:</strong> Jalan Rawa Gelam II No.3, Kawasan Industri Pulogadung, Jakarta Timur<br />
                        <strong>Telp:</strong> 021-344 3456 <strong>(Saluran Bersama) Faks:</strong> 021-460 2340/460 2344<br />
                        <strong>Email:</strong> info@cahayamascemerlang.com | <strong>Situs Web:</strong> www.cahayamascemerlang.com
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ width: "45%" }}>
                  <h1 className="doc-main-title">LAPORAN KALIBRASI</h1>
                  <div className="doc-no-title">Nomor Laporan: {detail.reportNo}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Station Table */}
          <table className="station-table">
            <tbody>
              <tr>
                <td className="st-label">Nama Stasiun</td>
                <td className="st-val">: {detail.stationName}</td>
                <td className="st-label">Tanggal Kalibrasi</td>
                <td className="st-val">: {formattedDateRange}</td>
              </tr>
              <tr>
                <td className="st-label">Alamat</td>
                <td className="st-val">: {detail.address || "-"}</td>
                <td className="st-label">Koordinat</td>
                <td className="st-val">
                  : {detail.coordinate || (detail.latitude && detail.longitude ? `LAT ${detail.latitude} | LONG ${detail.longitude}` : "-")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section 1: Kalibrasi Parameter Sensor */}
          <div className="section-header">1. Kalibrasi Parameter Sensor</div>

          <table className="cal-table">
            <thead>
              <tr>
                <th style={{ width: "16%" }}>Parameter</th>
                <th style={{ width: "21%" }}>Standar/CRM</th>
                <th style={{ width: "20%" }}>Hasil Pembacaan</th>
                <th style={{ width: "25%" }}>Koefisien Internal (K/B)</th>
                <th style={{ width: "12%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {detail.parameters.map((param) => {
                const paramTitle = `Kalibrasi ${formatCalibrationParameterName(param.parameterName)}`;

                // Build standards and CRM list
                const standardLines: string[] = param.results.map((r) =>
                  formatCalibrationStandard(
                    r.standardName,
                    r.standardValue,
                    param.parameterUnit,
                  ),
                );
                if (param.crmReferenceValue !== null && param.crmReferenceValue !== undefined) {
                  standardLines.push(
                    `CRM ${formatCalibrationMeasurement(param.crmReferenceValue)}${
                      param.parameterUnit && param.parameterName.toLowerCase() !== "ph"
                        ? ` ${param.parameterUnit}`
                        : ""
                    }`,
                  );
                }

                // Build readings list
                const readingLines: string[] = param.results.map((r) =>
                  formatCalibrationMeasurement(r.value),
                );
                if (param.crmReadingValue !== null && param.crmReadingValue !== undefined) {
                  const unitSuffix =
                    param.parameterUnit && param.parameterName.toLowerCase() !== "ph"
                      ? ` ${param.parameterUnit}`
                      : "";
                  readingLines.push(
                    `${formatCalibrationMeasurement(param.crmReadingValue)}${unitSuffix}`,
                  );
                }

                const effectiveStatus = deriveCalibrationDetailStatus(
                  param.parameterName,
                  param.results,
                  param.status,
                );

                return (
                  <tr key={param.id}>
                    <td style={{ textAlign: "left", fontWeight: 700 }}>
                      {paramTitle}
                    </td>
                    <td>
                      {standardLines.length > 0
                        ? standardLines.map((line, i) => <div key={i}>{line}</div>)
                        : "-"}
                    </td>
                    <td>
                      {readingLines.length > 0
                        ? readingLines.map((line, i) => <div key={i}>{line}</div>)
                        : "-"}
                    </td>
                    <td>{formatCoefficients(param)}</td>
                    <td>
                      <span
                        className={
                          effectiveStatus === "PASS"
                            ? "tag-pass"
                            : effectiveStatus === "FAILED"
                              ? "tag-fail"
                              : "tag-pending"
                        }
                      >
                        {effectiveStatus === "PASS"
                          ? "Memenuhi"
                          : effectiveStatus === "FAILED"
                            ? "Tidak Memenuhi"
                            : "Tidak diuji"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Section 2: Pengukuran Sampel Air dan Uji Blangko */}
          <div className="section-header">2. Pengukuran Sampel Air dan Uji Blangko</div>

          <table className="sample-table">
            <thead>
              <tr>
                <th style={{ width: "15%", textAlign: "left" }}>Jenis Sampel</th>
                {activeSampleColumns.map((col) => (
                  <th key={col.key}>
                    <span className="header-label">{col.label}</span>
                    <span className="header-unit">{col.unit}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.waterSamples.length > 0 ? (
                detail.waterSamples.map((sample, idx) => (
                  <tr key={sample.id || idx}>
                    <td>{sample.sampleName || "-"}</td>
                    {activeSampleColumns.map((col) => (
                      <td key={col.key}>
                        {formatCalibrationMeasurement(col.getter(sample))}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={activeSampleColumns.length + 1}
                    style={{ textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}
                  >
                    Tidak ada data sampel air
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Notes Box */}
          <div className="notes-box">
            <strong>Catatan:</strong>
            <div dangerouslySetInnerHTML={{ __html: sanitizedNotesHtml }} />
          </div>

          {/* Signature & QR Code Table */}
          <table className="sig-table">
            <tbody>
              <tr>
                <td>
                  <strong>Tempat/Tanggal:</strong> {placeDate}<br />
                  <strong>Petugas Kalibrasi:</strong>
                  <div className="sig-space">
                    {detail.qrCodeDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detail.qrCodeDataUrl}
                        alt={`Kode QR verifikasi ${detail.reportNo}`}
                      />
                    ) : (
                      <span style={{ fontSize: "7.5pt", color: "#94a3b8" }}>QR Code</span>
                    )}
                  </div>
                  <div className="sig-name">{detail.officer || "-"}</div>
                  <div className="sig-sub">PT Cahaya Mas Cemerlang</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Page 1 Document Footer */}
          <div className="footer-rev">
            <span>PT CAHAYA MAS CEMERLANG — LAPORAN KALIBRASI</span>
            <span>Halaman 1 dari {detail.parameters.length > 0 ? 2 : 1}</span>
          </div>
        </section>

        {/* ================= HALAMAN 2: LAMPIRAN DOKUMENTASI FOTO ================= */}
        {detail.parameters.length > 0 && (
          <section className="attachment-section">
            {/* Attachment Header Table */}
            <table className="header-table">
              <tbody>
                <tr>
                  <td style={{ width: "55%" }}>
                    <div className="company-header">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="company-logo"
                        src="https://uploads.onecompiler.io/44724abkh/1786077498764/icon-cmc.png"
                        alt="Logo PT Cahaya Mas Cemerlang"
                      />
                      <div>
                        <div className="company-name">PT Cahaya Mas Cemerlang</div>
                        <div className="company-info">
                          <strong>Kantor:</strong> Komplek Majapahit Permai Blok A No.110 &amp; C No.105, Jakarta Pusat<br />
                          <strong>Email:</strong> info@cahayamascemerlang.com | <strong>Situs Web:</strong> www.cahayamascemerlang.com
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "45%" }}>
                    <h2 className="doc-main-title">LAMPIRAN DOKUMENTASI</h2>
                    <div className="doc-no-title">Nomor Laporan: {detail.reportNo}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Station Table */}
            <table className="station-table">
              <tbody>
                <tr>
                  <td className="st-label">Nama Stasiun</td>
                  <td className="st-val" colSpan={3}>: {detail.stationName}</td>
                </tr>
              </tbody>
            </table>

            <div className="section-header">Dokumentasi Foto Kalibrasi Sesuai Parameter</div>

            <div>
              {detail.parameters.map((param) => {
                const paramTitle = formatCalibrationParameterName(param.parameterName);
                const beforeDoc = param.documentation?.before;
                const afterDoc = param.documentation?.after;

                return (
                  <div key={param.id} className="doc-param-item">
                    <div className="doc-param-title">
                      Dokumentasi Parameter: {paramTitle}
                    </div>

                    <div className="doc-grid">
                      {/* Before Photo */}
                      <div className="doc-col">
                        <div className="doc-slot-label">
                          Sebelum Kalibrasi (Before)
                        </div>
                        {beforeDoc?.previewUrl ? (
                          <div className="doc-photo-box">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={beforeDoc.previewUrl}
                              alt={`Sebelum Kalibrasi - ${paramTitle}`}
                            />
                          </div>
                        ) : (
                          <div className="doc-no-photo-box">
                            Tidak ada foto sebelum kalibrasi
                          </div>
                        )}
                      </div>

                      {/* After Photo */}
                      <div className="doc-col">
                        <div className="doc-slot-label">
                          Sesudah Kalibrasi (After)
                        </div>
                        {afterDoc?.previewUrl ? (
                          <div className="doc-photo-box">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={afterDoc.previewUrl}
                              alt={`Sesudah Kalibrasi - ${paramTitle}`}
                            />
                          </div>
                        ) : (
                          <div className="doc-no-photo-box">
                            Tidak ada foto sesudah kalibrasi
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page 2 Document Footer */}
            <div className="footer-rev">
              <span>PT CAHAYA MAS CEMERLANG — LAPORAN KALIBRASI</span>
              <span>Halaman 2 dari 2</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
