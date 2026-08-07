import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";

interface QRCodeCardProps {
  uuid: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ uuid }) => {
  const verificationUrl = `${window.location.origin}/verify/${uuid}`;

  return (
    <Card className="shadow-sm w-full max-w-[280px] mx-auto text-center">
      <CardHeader className="bg-slate-50 border-b py-3 px-4">
        <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Verify Calibration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
        <div className="bg-white p-2 border rounded-md shadow-inner">
          <QRCode value={verificationUrl} size={150} />
        </div>
        <div className="text-[10px] text-slate-500 leading-snug">
          Scan QR Code to verify the authenticity of this official calibration report.
        </div>
      </CardContent>
    </Card>
  );
};
