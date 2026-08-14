"use client";

import React from "react";
import { CalibrationDetail } from "@/types/calibration";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import cmcIcon from "@/assets/img/cmc_icon.png";
import { calibrationService } from "@/services/api/calibration";
import { useCalibrationAuth } from "@/hook/useCalibration";
import { formatCalibrationMeasurement } from "@/lib/calibration-format";

interface ReportPreviewProps {
  detail: CalibrationDetail;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ detail }) => {
  const { token } = useCalibrationAuth();
  const calibratedParameters = new Set(detail.parameters.map((parameter) => parameter.parameterName.trim().toLowerCase()));
  const includesParameter = (...names: string[]) => names.some((name) => calibratedParameters.has(name));

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  const formatPlace = (value: string) => {
    return value
      .replace(/\b(kabupaten|kota)\b/gi, "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayUnit = (unit?: string) => {
    if (!unit || unit.toLowerCase() === "ph") return "";
    return ` ${unit}`;
  };

  const standardLabel = (name: string, value: number | null, unit?: string) => {
    const displayValue = value === null ? name : formatCalibrationMeasurement(value);
    if (/crm/i.test(name)) return `CRM ${displayValue}${displayUnit(unit)}`;
    return `${displayValue}${displayUnit(unit)}`;
  };

  const renderCoefficients = (param: CalibrationDetail["parameters"][number]) => {
    if (param.coefficients.length === 0) return "-";
    const byKey = new Map(param.coefficients.map((coefficient) => [coefficient.key.toLowerCase(), coefficient.value]));
    if (param.coeffType === "K1-K6") {
      return [["k1", "k2"], ["k3", "k4"], ["k5", "k6"]].map(([left, right]) => (
        <div key={left} className="whitespace-nowrap">
          <strong>{left.toUpperCase()}:</strong> {byKey.get(left) ?? "-"} <span className="px-1">|</span>
          <strong>{right.toUpperCase()}:</strong> {byKey.get(right) ?? "-"}
        </div>
      ));
    }
    return ["b", "k"].filter((key) => byKey.has(key)).map((key) => <div key={key}><strong>{key.toUpperCase()}:</strong> {byKey.get(key)}</div>);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await calibrationService.downloadPdf(detail.id, token);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Calibration_Report_${detail.reportNo.replace(/\//g, "_")}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to download PDF", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action panel (Hidden on print) */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </Button>
        <Button onClick={handleDownloadPdf} className="gap-2">
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </div>

      <Card className="mx-auto max-w-[794px] border border-slate-200 bg-white p-8 font-sans text-[11px] leading-[1.35] text-slate-900 shadow-sm print:border-none print:p-0 print:shadow-none">
        {/* Company Header */}
        <div className="flex border-b-2 border-slate-900 pb-4 mb-4 items-center justify-between">
          <div className="flex items-start gap-3">
            <img
              src={cmcIcon.src}
              alt="CMC Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="font-bold text-sm tracking-wide uppercase text-slate-800">
                PT Cahaya Mas Cemerlang
              </div>
              <div className="max-w-[450px] text-[8px] leading-snug text-slate-500">
                <div>
                  <strong>Office:</strong> Komplek Majapahit Permai Blok A No.110 &amp; C No.105, Jl. Majapahit No.18-20-22, Jakarta Pusat 10160
                </div>
                <div>
                  <strong>Factory:</strong> Jalan Rawa Gelam II No.3, Kawasan Industri Pulogadung, Jakarta Timur
                </div>
                <div>
                  <strong>Telp:</strong> 021-344 3456 <strong>(Hunting) Fax:</strong> 021-460 2340/460 2344
                </div>
                <div>
                  <strong>E-mail:</strong> info@cahayamascemerlang.com | <strong>Website:</strong> www.cahayamascemerlang.com
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm text-blue-900 tracking-wide">CALIBRATION REPORT</div>
            <div className="mt-1 text-[10px] font-semibold text-slate-600">Report No: {detail.stationName}/{detail.reportNo}</div>
          </div>
        </div>

        {/* Station details */}
        <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2 border border-slate-300 bg-slate-50 p-3 text-[11px]">
          <div>
            <span className="font-bold text-slate-700">Station Name</span> : {detail.stationName}
          </div>
          <div>
            <span className="font-bold text-slate-700">Calibration Date</span> : {formatDate(detail.calibrationStartDate)} – {formatDate(detail.calibrationEndDate)}
          </div>
          <div>
            <span className="font-bold text-slate-700">Address</span> : {detail.address}
          </div>
          <div>
            <span className="font-bold text-slate-700">Coordinate</span> : LAT {detail.latitude} | LONG {detail.longitude}
          </div>
        </div>

        {/* Section 1 */}
        <div className="bg-slate-900 text-white font-bold px-3 py-1.5 uppercase tracking-wider mb-3">
          1. Sensor Parameter Calibration & Register Adjustment
        </div>
        <table className="mb-4 w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="w-[16%] border border-slate-300 p-2 text-center">Parameter</th>
              <th className="w-[21%] border border-slate-300 p-2 text-center">Standart / CRM</th>
              <th className="w-[20%] border border-slate-300 p-2 text-center">Hasil Pembacaan</th>
              <th className="w-[25%] border border-slate-300 p-2 text-center">Internal Coeff (K / B)</th>
              <th className="w-[12%] border border-slate-300 p-2 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {detail.parameters.map((param, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="border border-slate-300 p-2 font-bold">{param.parameterName} Calibration</td>
                <td className="border border-slate-300 p-2 text-center align-middle">
                  {param.results.map((r, i) => <div key={r.id ?? i}>{standardLabel(r.standardName, r.standardValue, param.parameterUnit)}</div>)}
                  {param.crmReferenceValue !== null && !param.results.some((result) => /crm/i.test(result.standardName)) && (
                    <div>CRM {param.crmReferenceValue}{displayUnit(param.parameterUnit)}</div>
                  )}
                </td>
                <td className="border border-slate-300 p-2 text-center align-middle">
                  {param.results.filter((result) => !/crm/i.test(result.standardName)).map((r, i) => <div key={r.id ?? i}>{formatCalibrationMeasurement(r.value)}</div>)}
                  {param.crmReadingValue !== null && (
                    <div>{formatCalibrationMeasurement(param.crmReadingValue)}{displayUnit(param.parameterUnit)}</div>
                  )}
                </td>
                <td className="border border-slate-300 p-2 text-center align-middle">
                  {renderCoefficients(param)}
                </td>
                <td className="border border-slate-300 p-2 text-center align-middle font-medium uppercase">
                  <span className={param.status === "PASS" ? "border border-green-200 bg-green-50 px-1 py-0.5 font-bold text-green-700" : param.status === "FAILED" ? "border border-red-200 bg-red-50 px-1 py-0.5 font-bold text-red-700" : ""}>{param.status ?? "PENDING"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section 2 */}
        <div className="bg-slate-900 text-white font-bold px-3 py-1.5 uppercase tracking-wider mb-3">
          2. Water Sample Measurement & Blank Test
        </div>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-[6.5px]">
            <thead>
              <tr className="bg-blue-900 text-white border-b">
                <th className="w-[15%] border p-1 text-left">Sample Type</th>
                <th className="border p-1 text-center">Temp<br />(°C)</th>
                {includesParameter("do") && <th className="border p-1 text-center">DO<br />(mg/L)</th>}
                {includesParameter("tds") && <th className="border p-1 text-center">TDS<br />(mg/L)</th>}
                {includesParameter("turbidity") && <th className="border p-1 text-center">Turb<br />(NTU)</th>}
                {includesParameter("ph") && <th className="border p-1 text-center">pH<br />Unit</th>}
                {includesParameter("orp") && <th className="border p-1 text-center">ORP<br />(mV)</th>}
                {includesParameter("cod") && <th className="border p-1 text-center">COD<br />(mg/L)</th>}
                {includesParameter("bod") && <th className="border p-1 text-center">BOD<br />(mg/L)</th>}
                {includesParameter("tss") && <th className="border p-1 text-center">TSS<br />(mg/L)</th>}
                {includesParameter("amonia", "nh3") && <th className="border p-1 text-center">NH3-N<br />(mg/L)</th>}
                {includesParameter("nitrat", "no3") && <th className="border p-1 text-center">NO3-N<br />(mg/L)</th>}
                {includesParameter("nitrit", "no2") && <th className="border p-1 text-center">NO2-N<br />(mg/L)</th>}
                {includesParameter("kedalaman", "level", "depth") && <th className="border p-1 text-center">Kedalaman<br />(m)</th>}
              </tr>
            </thead>
            <tbody>
              {detail.waterSamples.map((sample, index) => (
                <tr key={index} className="border-b">
                  <td className="border p-1.5 font-bold">{sample.sampleName}</td>
                  <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.temperature)}</td>
                  {includesParameter("do") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.doValue)}</td>}
                  {includesParameter("tds") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.tds)}</td>}
                  {includesParameter("turbidity") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.turbidity)}</td>}
                  {includesParameter("ph") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.ph)}</td>}
                  {includesParameter("orp") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.orp)}</td>}
                  {includesParameter("cod") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.cod)}</td>}
                  {includesParameter("bod") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.bod)}</td>}
                  {includesParameter("tss") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.tss)}</td>}
                  {includesParameter("amonia", "nh3") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.nh3)}</td>}
                  {includesParameter("nitrat", "no3") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.no3)}</td>}
                  {includesParameter("nitrit", "no2") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.no2)}</td>}
                  {includesParameter("kedalaman", "level", "depth") && <td className="border p-1.5 text-center">{formatCalibrationMeasurement(sample.depth)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="border border-slate-300 bg-slate-50 p-3 rounded mb-4 text-[10px]">
          <span className="font-bold text-slate-800">Notes:</span>
          <div className="calibration-notes-preview mt-1 text-slate-600" dangerouslySetInnerHTML={{ __html: detail.notes || "-" }} />
        </div>

        {/* Signatures */}
        <div className="mt-6 text-[11px]">
          <div className="text-left">
            <p><strong>Place / Date:</strong> {formatPlace(detail.stationCity || detail.address)}, {formatDate(detail.calibrationEndDate)}</p>
            <p><strong>Calibration Officer:</strong></p>
            <div className="mt-2 inline-flex flex-col items-center">
              {detail.qrCodeDataUrl && (
                <div className="bg-white p-1 border rounded-md inline-block">
                  <img src={detail.qrCodeDataUrl} alt={`QR verifikasi ${detail.reportNo}`} width={93} height={93} />
                </div>
              )}
              <div className="mt-2 font-bold text-slate-800">{detail.officer}</div>
              <div className="text-[9px] text-slate-500">PT Cahaya Mas Cemerlang</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
