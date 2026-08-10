import React from "react";
import { CalibrationDetail } from "@/types/calibration";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import cmcIcon from "@/assets/img/cmc_icon.png";
import { calibrationService } from "@/services/api/calibration";
import { useCalibrationAuth } from "@/hook/useCalibration";

interface ReportPreviewProps {
  detail: CalibrationDetail;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ detail }) => {
  const { token } = useCalibrationAuth();
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

      <Card className="max-w-[800px] mx-auto bg-white text-black p-8 font-sans text-xs border border-slate-200 shadow-sm leading-relaxed print:p-0 print:border-none print:shadow-none">
        {/* Company Header */}
        <div className="flex border-b-2 border-slate-900 pb-4 mb-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={cmcIcon.src}
              alt="CMC Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="font-bold text-sm tracking-wide uppercase text-slate-800">
                PT Cahaya Mas Cemerlang
              </div>
              <div className="text-[9px] text-slate-500 max-w-[450px] leading-snug">
                Komplek Majapahit Permai Blok A No.110 & C No.105, Jakarta Pusat | Telp: 021-344 3456
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm text-blue-900 tracking-wide">CALIBRATION REPORT</div>
            <div className="font-semibold text-[10px] text-slate-600 mt-1">Report No: {detail.reportNo}</div>
          </div>
        </div>

        {/* Station details */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-slate-50 border p-3 rounded mb-4 text-[11px]">
          <div>
            <span className="font-bold text-slate-700">Station Name:</span> {detail.stationName}
          </div>
          <div>
            <span className="font-bold text-slate-700">Calibration Date:</span> {detail.calibrationDate}
          </div>
          <div>
            <span className="font-bold text-slate-700">Address:</span> {detail.address}
          </div>
          <div>
            <span className="font-bold text-slate-700">Contact Person:</span> {detail.contactPerson}
          </div>
          <div>
            <span className="font-bold text-slate-700">Coordinate:</span> LAT {detail.latitude} | LONG {detail.longitude}
          </div>
          <div>
            <span className="font-bold text-slate-700">Phone:</span> {detail.phone}
          </div>
        </div>

        {/* Section 1 */}
        <div className="bg-slate-900 text-white font-bold px-3 py-1.5 uppercase tracking-wider mb-3">
          1. Sensor Parameter Calibration & Register Adjustment
        </div>
        <table className="w-full border-collapse mb-4 text-[10px]">
          <thead>
            <tr className="bg-slate-100 border-b">
              <th className="border p-2 text-left w-1/4">Parameter</th>
              <th className="border p-2 text-center w-1/6">Target/Spec</th>
              <th className="border p-2 text-left">CRM / Standard Level</th>
              <th className="border p-2 text-center">Calibration Result</th>
              <th className="border p-2 text-left">Internal Coeff (K / B)</th>
            </tr>
          </thead>
          <tbody>
            {detail.parameters.map((param, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="border p-2 font-bold">{param.parameterName}</td>
                <td className="border p-2 text-center">{param.spec}</td>
                <td className="border p-2">
                  {param.results.map((r, i) => (
                    <div key={i}>{r.standardName}</div>
                  ))}
                </td>
                <td className="border p-2 text-center">
                  {param.results.map((r, i) => (
                    <div key={i}>{r.value}</div>
                  ))}
                </td>
                <td className="border p-2">
                  {param.coefficients.map((c, i) => (
                    <div key={i}>
                      <strong>{c.key}:</strong> {c.value}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section 2 */}
        <div className="bg-slate-900 text-white font-bold px-3 py-1.5 uppercase tracking-wider mb-3">
          2. Water Sample Measurement & Blank Test
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-[9px] min-w-[600px]">
            <thead>
              <tr className="bg-blue-900 text-white border-b">
                <th className="border p-1.5 text-left">Sample Type</th>
                <th className="border p-1.5 text-center">Temp (°C)</th>
                <th className="border p-1.5 text-center">DO (mg/L)</th>
                <th className="border p-1.5 text-center">TDS (mg/L)</th>
                <th className="border p-1.5 text-center">Turb (NTU)</th>
                <th className="border p-1.5 text-center">pH Unit</th>
                <th className="border p-1.5 text-center">COD (mg/L)</th>
                <th className="border p-1.5 text-center">BOD (mg/L)</th>
                <th className="border p-1.5 text-center">TSS (mg/L)</th>
                <th className="border p-1.5 text-center">NH3-N (mg/L)</th>
                <th className="border p-1.5 text-center">NO3-N (mg/L)</th>
              </tr>
            </thead>
            <tbody>
              {detail.waterSamples.map((sample, index) => (
                <tr key={index} className="border-b">
                  <td className="border p-1.5 font-bold">{sample.sampleName}</td>
                  <td className="border p-1.5 text-center">{sample.temperature ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.doValue ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.tds ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.turbidity ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.ph ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.cod ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.bod ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.tss ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.nh3 ?? "-"}</td>
                  <td className="border p-1.5 text-center">{sample.no3 ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="border border-slate-300 bg-slate-50 p-3 rounded mb-4 text-[10px]">
          <span className="font-bold text-slate-800">Notes:</span>
          <p className="mt-1 whitespace-pre-line text-slate-600">{detail.notes}</p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 mt-8 text-[11px]">
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-600">Place / Date: {detail.stationCity || detail.address}, {detail.calibrationDate}</p>
            <p className="font-semibold text-slate-600">Calibration Officer:</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-800">{detail.officer}</p>
            <p className="text-[9px] text-slate-500">PT Cahaya Mas Cemerlang</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-600">Place / Date: {detail.stationCity || detail.address}, {detail.calibrationDate}</p>
            <p className="font-semibold text-slate-600">Customer / Representative:</p>
            <div className="h-16" />
            <p className="font-bold text-slate-400">( ___________________________ )</p>
            <p className="text-[9px] text-slate-500">Pengelola Stasiun</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
