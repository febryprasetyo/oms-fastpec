"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QRCodeCard({ dataUrl, verificationUrl, reportNo }: { dataUrl: string; verificationUrl?: string; reportNo: string }) {
  return <Card className="mx-auto w-full max-w-[280px] text-center shadow-sm"><CardHeader><CardTitle className="text-xs uppercase tracking-wider">Verify Calibration</CardTitle></CardHeader><CardContent className="flex flex-col items-center gap-3 p-6"><img src={dataUrl} alt={`QR verifikasi ${reportNo}`} width={180} height={180} />{verificationUrl && <a className="break-all text-xs text-primary underline" href={verificationUrl} target="_blank" rel="noreferrer">Buka halaman verifikasi</a>}</CardContent></Card>;
}
