import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { CalibrationFormValues } from "@/schemas/calibration.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCalibrationParameterName } from "@/lib/calibration-format";
import { CalibrationDocumentation } from "./CalibrationDocumentation";
import type { CalibrationPhotoType, CalibrationStatus, ParameterCalibrationDocumentation } from "@/types/calibration";

interface ParameterTableProps {
  form: UseFormReturn<CalibrationFormValues>;
  calibrationId?: string;
  status?: CalibrationStatus;
  ensurePersistedDetail?: (parameterId: string) => Promise<number>;
  onDocumentationBusyChange?: (parameterId: string, photoType: CalibrationPhotoType, busy: boolean) => void;
  invalidDocumentationParameterIds?: string[];
  documentationByParameter?: Record<string, ParameterCalibrationDocumentation>;
}

export const ParameterTable: React.FC<ParameterTableProps> = ({
  form,
  calibrationId,
  status = "Draft",
  ensurePersistedDetail,
  onDocumentationBusyChange,
  invalidDocumentationParameterIds = [],
  documentationByParameter = {},
}) => {
  const { control, register } = form;
  const { fields } = useFieldArray({
    control,
    name: "parameters",
  });

  return (
    <div role="region" aria-label="Input parameter kalibrasi" className="grid min-w-0 grid-cols-1 gap-6 overflow-x-auto 2xl:grid-cols-2">
      {fields.map((field, index) => {
        const paramName = form.watch(`parameters.${index}.parameterName`);
        const detailId = form.watch(`parameters.${index}.id`);
        const spec = form.watch(`parameters.${index}.spec`);
        const coeffType = form.watch(`parameters.${index}.coeffType`);

        return (
          <Card
            key={field.id}
            tabIndex={-1}
            data-calibration-parameter-id={field.parameterId}
            className={`min-w-0 overflow-hidden shadow-sm ${invalidDocumentationParameterIds.includes(field.parameterId) ? "border-red-500 ring-1 ring-red-500" : ""}`}
          >
            <CardHeader className="bg-slate-50 border-b py-3 px-4">
              <CardTitle className="flex min-w-0 flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-800">
                <span>{formatCalibrationParameterName(paramName)} Kalibrasi</span>
                <span className="text-xs font-normal text-slate-500">
                  Spesifikasi: {spec}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-w-0 space-y-4 p-4">
              <div>
                <Label className="text-xs font-bold text-slate-600 block mb-2">
                  Hasil Kalibrasi (Standar)
                </Label>
                <div className="space-y-3">
                  {form.watch(`parameters.${index}.results`)?.map((res, resIndex) => (
                    <div key={resIndex} className="grid min-w-0 grid-cols-[minmax(80px,1fr)_minmax(0,2fr)] items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">{res.standardName}</span>
                      <Input
                        className="h-8 min-w-0 w-full text-xs"
                        placeholder="Nilai terukur"
                        {...register(`parameters.${index}.results.${resIndex}.value` as const)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {coeffType && <div className="border-t pt-3">
                <Label className="text-xs font-bold text-slate-600 block mb-2">
                  Koefisien Internal ({coeffType})
                </Label>
                <p className="mb-2 text-[11px] text-muted-foreground">
                  Masukkan nilai koefisien dari proses kalibrasi.
                </p>
                <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                  {form.watch(`parameters.${index}.coefficients`)?.map((coeff, coeffIndex) => (
                    <div key={coeffIndex} className="flex min-w-0 items-center gap-2">
                      <span className="w-8 text-xs font-semibold uppercase text-slate-500">{coeff.key}:</span>
                      <Input
                        type="number"
                        step="any"
                        className="h-8 min-w-0 w-full text-xs"
                        {...register(`parameters.${index}.coefficients.${coeffIndex}.value` as const)}
                      />
                    </div>
                  ))}
                </div>
              </div>}
              <div className="grid min-w-0 grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-2">
                <div><Label className="text-xs">Nilai Referensi CRM</Label><Input type="number" step="any" disabled={paramName.toLowerCase() === "ph"} {...register(`parameters.${index}.crmReferenceValue` as const)} /></div>
                <div><Label className="text-xs">Nilai Pembacaan CRM</Label><Input type="number" step="any" disabled={paramName.toLowerCase() === "ph"} {...register(`parameters.${index}.crmReadingValue` as const)} /></div>
              </div>
              {calibrationId && ensurePersistedDetail && <CalibrationDocumentation
                calibrationId={calibrationId}
                parameterId={field.parameterId}
                detailId={detailId}
                documentation={documentationByParameter[field.parameterId] ?? {}}
                readOnly={status === "Approved"}
                ensurePersistedDetail={ensurePersistedDetail}
                onBusyChange={(photoType, busy) => onDocumentationBusyChange?.(field.parameterId, photoType, busy)}
              />}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
