import React from "react";
import { formatCalibrationParameterName } from "@/lib/calibration-format";
import type { ParameterCalibrationDetail } from "@/types/calibration";

export function CalibrationDocumentationReadOnly({ parameters }: { parameters: ParameterCalibrationDetail[] }) {
  if (parameters.length === 0) return null;

  return <section className="space-y-4 rounded-lg border bg-white p-4 print:break-before-page">
    <h2 className="text-base font-semibold text-slate-800">Dokumentasi Kalibrasi</h2>
    {parameters.map((parameter) => {
      const parameterName = formatCalibrationParameterName(parameter.parameterName);
      return <article key={parameter.id} className="space-y-3 rounded-md border p-3 print:break-inside-avoid">
        <h3 className="text-sm font-semibold text-slate-700">Dokumentasi Kalibrasi {parameterName}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Before Calibration</p>
            {parameter.documentation.before
              ? <>{/* Backend-signed preview URLs are intentionally passed through unchanged. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                  src={parameter.documentation.before.previewUrl}
                  alt={`Before Calibration ${parameterName}`}
                  className="aspect-[4/3] w-full rounded-md border bg-slate-50 object-contain"
                  />
                </>
              : <div className="flex aspect-[4/3] items-center justify-center rounded-md border bg-slate-50 p-3 text-center text-xs text-slate-500">Before Calibration: tidak didokumentasikan</div>}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">After Calibration</p>
            {parameter.documentation.after
              ? <>{/* Backend-signed preview URLs are intentionally passed through unchanged. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                  src={parameter.documentation.after.previewUrl}
                  alt={`After Calibration ${parameterName}`}
                  className="aspect-[4/3] w-full rounded-md border bg-slate-50 object-contain"
                  />
                </>
              : <div className="flex aspect-[4/3] items-center justify-center rounded-md border bg-slate-50 p-3 text-center text-xs text-slate-500">After Calibration: tidak didokumentasikan</div>}
          </div>
        </div>
      </article>;
    })}
  </section>;
}
