"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatCalibrationDate,
  formatCalibrationDateRange,
  formatCalibrationMeasurement,
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
      <div className="space-y-0.5 text-center text-[10.5px]">
        {pairs.map(([kLeft, kRight], idx) => {
          const vLeft = coeffMap.get(kLeft);
          const vRight = coeffMap.get(kRight);
          const parts: string[] = [];
          if (vLeft !== undefined)
            parts.push(`${kLeft.toUpperCase()}: ${formatCalibrationMeasurement(vLeft)}`);
          if (vRight !== undefined)
            parts.push(`${kRight.toUpperCase()}: ${formatCalibrationMeasurement(vRight)}`);
          if (parts.length === 0) return null;
          return <div key={idx}>{parts.join(" | ")}</div>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-0.5 text-center text-[10.5px]">
      {param.coefficients.map((c, idx) => (
        <div key={idx}>
          <span className="font-semibold">{c.key.toUpperCase()}:</span>{" "}
          {c.value !== undefined ? formatCalibrationMeasurement(c.value) : "-"}
        </div>
      ))}
    </div>
  );
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
    window.print();
  };

  return (
    <div className="space-y-4">
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
        className="mx-auto w-full max-w-[820px] rounded-xl border border-slate-300 bg-white p-6 sm:p-10 text-[#1a202c] shadow-lg print:border-none print:p-0 print:shadow-none font-sans"
        style={{ fontSize: "11px", lineHeight: 1.35 }}
      >
        {/* ================= HALAMAN 1: LAPORAN KALIBRASI ================= */}
        <section className="print:break-after-page">
          {/* Header Table */}
          <div className="flex justify-between items-start border-b-2 border-[#0f2942] pb-3 mb-3">
            <div className="flex items-start gap-3 max-w-[62%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://uploads.onecompiler.io/44724abkh/1786077498764/icon-cmc.png"
                alt="Logo PT Cahaya Mas Cemerlang"
                className="h-16 w-16 object-contain shrink-0"
              />
              <div>
                <h1 className="text-sm font-bold text-[#0f2942] uppercase tracking-wide">
                  PT Cahaya Mas Cemerlang
                </h1>
                <div className="text-[9.5px] text-slate-700 leading-snug space-y-0.5 mt-0.5">
                  <div>
                    <strong>Kantor:</strong> Komplek Majapahit Permai Blok A No.110 & C No.105, Jl. Majapahit No.18-20-22, Jakarta Pusat 10160
                  </div>
                  <div>
                    <strong>Pabrik:</strong> Jalan Rawa Gelam II No.3, Kawasan Industri Pulogadung, Jakarta Timur
                  </div>
                  <div>
                    <strong>Telp:</strong> 021-344 3456 <strong>(Saluran Bersama) Faks:</strong> 021-460 2340/460 2344
                  </div>
                  <div>
                    <strong>Email:</strong> info@cahayamascemerlang.com | <strong>Situs Web:</strong> www.cahayamascemerlang.com
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-base font-extrabold text-[#1e3a8a] uppercase tracking-wider">
                LAPORAN KALIBRASI
              </h2>
              <p className="text-[11px] font-bold text-slate-600 mt-1">
                Nomor Laporan: {detail.reportNo}
              </p>
            </div>
          </div>

          {/* Station Metadata Table */}
          <div className="mb-3 border border-slate-300 bg-slate-50/80 text-[10.5px]">
            <div className="grid grid-cols-12 gap-1 p-2">
              <div className="col-span-2 font-bold text-slate-800">Nama Stasiun</div>
              <div className="col-span-4 text-slate-900">: {detail.stationName}</div>
              <div className="col-span-2 font-bold text-slate-800">Tanggal Kalibrasi</div>
              <div className="col-span-4 text-slate-900">: {formattedDateRange}</div>

              <div className="col-span-2 font-bold text-slate-800">Alamat</div>
              <div className="col-span-4 text-slate-900">: {detail.address || "-"}</div>
              <div className="col-span-2 font-bold text-slate-800">Koordinat</div>
              <div className="col-span-4 text-slate-900">
                : {detail.coordinate || (detail.latitude && detail.longitude ? `LAT ${detail.latitude} | LONG ${detail.longitude}` : "-")}
              </div>
            </div>
          </div>

          {/* Section 1: Kalibrasi Parameter Sensor */}
          <div className="bg-[#0f2942] text-white font-bold text-xs px-2.5 py-1 uppercase tracking-wider my-2">
            1. Kalibrasi Parameter Sensor
          </div>

          <div className="overflow-x-auto mb-3">
            <table className="w-full border-collapse border border-slate-300 text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 text-[#0f2942]">
                  <th className="border border-slate-300 px-2 py-1.5 text-center font-bold w-[18%]">
                    Parameter
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center font-bold w-[22%]">
                    Standar/CRM
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center font-bold w-[20%]">
                    Hasil Pembacaan
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center font-bold w-[26%]">
                    Koefisien Internal (K/B)
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center font-bold w-[14%]">
                    Status
                  </th>
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

                  return (
                    <tr key={param.id} className="hover:bg-slate-50/50">
                      <td className="border border-slate-300 px-2.5 py-1.5 font-bold align-middle">
                        {paramTitle}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center align-middle">
                        {standardLines.length > 0
                          ? standardLines.map((line, i) => <div key={i}>{line}</div>)
                          : "-"}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center align-middle">
                        {readingLines.length > 0
                          ? readingLines.map((line, i) => <div key={i}>{line}</div>)
                          : "-"}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center align-middle">
                        {formatCoefficients(param)}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center align-middle">
                        {param.status === "PASS" ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-green-700 bg-green-50 border border-green-200">
                            Memenuhi
                          </span>
                        ) : param.status === "FAILED" ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-red-700 bg-red-50 border border-red-200">
                            Tidak Memenuhi
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200">
                            Tidak diuji
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 2: Pengukuran Sampel Air dan Uji Blangko */}
          <div className="bg-[#0f2942] text-white font-bold text-xs px-2.5 py-1 uppercase tracking-wider my-2">
            2. Pengukuran Sampel Air dan Uji Blangko
          </div>

          <div className="overflow-x-auto mb-3">
            <table className="w-full border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-[#1e3a8a] text-white">
                  <th className="border border-[#1e3a8a] px-2 py-1 text-left font-bold w-[18%]">
                    Jenis Sampel
                  </th>
                  {activeSampleColumns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-[#1e3a8a] px-1.5 py-1 text-center font-bold whitespace-nowrap"
                    >
                      <span className="block">{col.label}</span>
                      <span className="block text-[8.5px] font-normal opacity-90">
                        {col.unit}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.waterSamples.length > 0 ? (
                  detail.waterSamples.map((sample, idx) => (
                    <tr key={sample.id || idx} className="hover:bg-slate-50/50">
                      <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-800">
                        {sample.sampleName || "-"}
                      </td>
                      {activeSampleColumns.map((col) => (
                        <td
                          key={col.key}
                          className="border border-slate-300 px-1 py-1.5 text-center"
                        >
                          {formatCalibrationMeasurement(col.getter(sample))}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={activeSampleColumns.length + 1}
                      className="border border-slate-300 p-3 text-center text-slate-400 italic"
                    >
                      Tidak ada data sampel air
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Notes Box */}
          <div className="border border-slate-300 bg-slate-50/80 p-3 text-[10.5px] mb-4">
            <strong className="block text-slate-800 mb-1">Catatan:</strong>
            <div
              className="prose prose-sm max-w-none text-slate-700 text-[10.5px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
              dangerouslySetInnerHTML={{ __html: sanitizedNotesHtml }}
            />
          </div>

          {/* Signature & QR Code Block */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between items-end">
              <div className="space-y-1 text-[11px]">
                <div>
                  <strong>Tempat/Tanggal:</strong> {placeDate}
                </div>
                <div>
                  <strong>Petugas Kalibrasi:</strong>
                </div>
                <div className="h-24 w-24 border border-slate-300 bg-white p-1 my-1 flex items-center justify-center">
                  {detail.qrCodeDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.qrCodeDataUrl}
                      alt={`Kode QR verifikasi ${detail.reportNo}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400 text-center">QR Code</span>
                  )}
                </div>
                <div className="font-bold underline text-slate-900">
                  {detail.officer || "-"}
                </div>
                <div className="text-[10px] text-slate-500">PT Cahaya Mas Cemerlang</div>
              </div>
            </div>
          </div>

          {/* Page 1 Document Footer */}
          <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500 font-sans">
            <span>PT CAHAYA MAS CEMERLANG — LAPORAN KALIBRASI RESMI</span>
            <span>Halaman 1 dari {detail.parameters && detail.parameters.length > 0 ? "2" : "1"}</span>
          </div>
        </section>

        {/* ================= HALAMAN 2: LAMPIRAN DOKUMENTASI FOTO ================= */}
        {detail.parameters.length > 0 && (
          <section className="mt-8 pt-8 border-t-2 border-dashed border-slate-300 print:mt-0 print:pt-0 print:border-none print:break-before-page">
            {/* Attachment Header */}
            <div className="flex justify-between items-start border-b-2 border-[#0f2942] pb-3 mb-3">
              <div className="flex items-start gap-3 max-w-[62%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://uploads.onecompiler.io/44724abkh/1786077498764/icon-cmc.png"
                  alt="Logo PT Cahaya Mas Cemerlang"
                  className="h-16 w-16 object-contain shrink-0"
                />
                <div>
                  <h2 className="text-sm font-bold text-[#0f2942] uppercase tracking-wide">
                    PT Cahaya Mas Cemerlang
                  </h2>
                  <div className="text-[9.5px] text-slate-700 leading-snug space-y-0.5 mt-0.5">
                    <div>
                      <strong>Kantor:</strong> Komplek Majapahit Permai Blok A No.110 & C No.105, Jakarta Pusat
                    </div>
                    <div>
                      <strong>Email:</strong> info@cahayamascemerlang.com | <strong>Web:</strong> www.cahayamascemerlang.com
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-base font-extrabold text-[#1e3a8a] uppercase tracking-wider">
                  LAMPIRAN DOKUMENTASI
                </h3>
                <p className="text-[11px] font-bold text-slate-600 mt-1">
                  Nomor Laporan: {detail.reportNo}
                </p>
              </div>
            </div>

            {/* Station name banner */}
            <div className="mb-3 border border-slate-300 bg-slate-50/80 p-2 text-[10.5px]">
              <strong>Nama Stasiun:</strong> {detail.stationName}
            </div>

            <div className="bg-[#0f2942] text-white font-bold text-xs px-2.5 py-1 uppercase tracking-wider my-2">
              Dokumentasi Foto Kalibrasi Sesuai Parameter
            </div>

            <div className="space-y-4 my-3">
              {detail.parameters.map((param) => {
                const paramTitle = formatCalibrationParameterName(param.parameterName);
                const beforeDoc = param.documentation?.before;
                const afterDoc = param.documentation?.after;

                return (
                  <div
                    key={param.id}
                    className="border border-slate-300 rounded-md bg-white p-3 space-y-2 print:break-inside-avoid"
                  >
                    <div className="font-bold text-[#0f2942] text-xs border-l-4 border-[#1e3a8a] pl-2 py-0.5 border-b border-slate-100 pb-1">
                      Dokumentasi Parameter: {paramTitle}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Before Photo */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-700 uppercase">
                          Sebelum Kalibrasi (Before)
                        </div>
                        {beforeDoc?.previewUrl ? (
                          <div className="h-44 w-full border border-slate-200 rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={beforeDoc.previewUrl}
                              alt={`Sebelum Kalibrasi - ${paramTitle}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-44 w-full border border-dashed border-slate-300 rounded bg-slate-50/60 flex items-center justify-center text-[10.5px] text-slate-400 italic">
                            Tidak ada foto sebelum kalibrasi
                          </div>
                        )}
                      </div>

                      {/* After Photo */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-700 uppercase">
                          Sesudah Kalibrasi (After)
                        </div>
                        {afterDoc?.previewUrl ? (
                          <div className="h-44 w-full border border-slate-200 rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={afterDoc.previewUrl}
                              alt={`Sesudah Kalibrasi - ${paramTitle}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-44 w-full border border-dashed border-slate-300 rounded bg-slate-50/60 flex items-center justify-center text-[10.5px] text-slate-400 italic">
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
            <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500 font-sans">
              <span>PT CAHAYA MAS CEMERLANG — LAPORAN KALIBRASI RESMI</span>
              <span>Halaman 2 dari 2</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
