"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useCalibrationVerify } from "@/hook/useCalibration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatCalibrationDateRange,
  formatCalibrationMeasurement,
  translateCalibrationStatus,
} from "@/lib/calibration-format";

export default function VerificationPage() {
  const { uuid } = useParams() as { uuid: string };
  const { data: detail, isLoading, error } = useCalibrationVerify(uuid);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600 font-medium">Memverifikasi keaslian laporan...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader className="bg-red-50 text-center pb-4">
            <div className="mx-auto bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-red-800">Verifikasi Gagal</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-sm text-slate-600 leading-relaxed">
            Sertifikat kalibrasi ini tidak dapat diverifikasi. Hash dokumen mungkin telah diubah atau dokumen ini bukan sertifikat sah yang diterbitkan oleh PT Cahaya Mas Cemerlang.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center gap-6">
      <Card className="max-w-2xl w-full border-green-200 shadow-lg">
        <CardHeader className="bg-green-50 text-center pb-4 border-b border-green-100">
          <div className="mx-auto bg-green-100 text-green-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-green-800">Laporan Kalibrasi Autentik</CardTitle>
          <p className="text-xs text-green-600 font-semibold mt-1">Terverifikasi dan diterbitkan oleh PT Cahaya Mas Cemerlang</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 block">Nomor Laporan</span>
              <span className="text-slate-800 font-semibold">{detail.reportNo}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Nama Stasiun</span>
              <span className="text-slate-800 font-semibold">{detail.stationName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Tanggal Kalibrasi</span>
              <span className="text-slate-800 font-semibold">{formatCalibrationDateRange(detail.calibrationStartDate, detail.calibrationEndDate)}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Petugas Kalibrasi</span>
              <span className="text-slate-800 font-semibold">{detail.officer}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Alamat</span>
              <span className="text-slate-800 font-semibold">{detail.address}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Koordinat</span>
              <span className="text-slate-800 font-semibold">{detail.latitude}, {detail.longitude}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Catatan</h4>
            <div
              className="calibration-notes-preview rounded-md border bg-slate-50 p-3 text-slate-600"
              dangerouslySetInnerHTML={{ __html: detail.notes || "-" }}
            />
          </div>

          <div className="space-y-3"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Sampel Air</h4><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Sampel</TableHead><TableHead>Suhu</TableHead><TableHead>pH</TableHead><TableHead>DO</TableHead><TableHead>Kekeruhan</TableHead><TableHead>TDS</TableHead></TableRow></TableHeader><TableBody>{detail.waterSamples.length === 0 ? <TableRow><TableCell colSpan={6} className="py-4 text-center text-muted-foreground">Tidak ada sampel air.</TableCell></TableRow> : detail.waterSamples.map((sample) => <TableRow key={sample.id}><TableCell>{sample.sampleName}</TableCell><TableCell>{formatCalibrationMeasurement(sample.temperature)}</TableCell><TableCell>{formatCalibrationMeasurement(sample.ph)}</TableCell><TableCell>{formatCalibrationMeasurement(sample.doValue)}</TableCell><TableCell>{formatCalibrationMeasurement(sample.turbidity)}</TableCell><TableCell>{formatCalibrationMeasurement(sample.tds)}</TableCell></TableRow>)}</TableBody></Table></div></div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Parameter Kalibrasi</h4>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-700 text-xs">Parameter</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.parameters.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-xs text-slate-800">{p.parameterName}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-200 uppercase">
                          {translateCalibrationStatus(p.status)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
