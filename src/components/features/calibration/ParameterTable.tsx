import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { CalibrationFormValues } from "@/schemas/calibration.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCalibrationParameterName } from "@/lib/calibration-format";
import { warnAndNormalizeDecimalInput } from "@/lib/decimal-input";
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
  const { control } = form;
  const { fields } = useFieldArray({
    control,
    name: "parameters",
  });

  return (
    <div role="region" aria-label="Input parameter kalibrasi" className="grid w-full min-w-0 grid-cols-1 gap-5 overflow-x-auto lg:grid-cols-2">
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
            className={`min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-sm ${
              invalidDocumentationParameterIds.includes(field.parameterId) ? "border-red-500 ring-2 ring-red-500/20" : ""
            }`}
          >
            <CardHeader className="bg-slate-50/70 border-b border-slate-200/70 py-3 px-4 sm:px-5">
              <CardTitle className="flex min-w-0 flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="font-bold text-slate-800">{formatCalibrationParameterName(paramName)} Kalibrasi</span>
                </span>
                {spec && (
                  <span className="text-[11px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Spesifikasi: {spec}
                  </span>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="min-w-0 space-y-4 p-4 sm:p-5">
              {/* Hasil Kalibrasi Standar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold text-slate-800">Hasil Kalibrasi (Standar)</Label>
                  <span className="text-[10px] text-slate-400 font-medium">CRM / Solusi Standar (Desimal: koma)</span>
                </div>
                <div className="space-y-2">
                  {form.watch(`parameters.${index}.results`)?.map((res, resIndex) => (
                    <div
                      key={resIndex}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/70"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-slate-700 truncate">{res.standardName}</span>
                        {res.standardValue !== null && res.standardValue !== undefined && (
                          <span className="text-[10px] text-slate-400 font-mono">({res.standardValue})</span>
                        )}
                      </div>
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="h-8 min-w-0 w-full sm:w-44 text-xs font-medium bg-white border-slate-300 shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Nilai terukur (mis: 7,00)"
                        value={form.watch(`parameters.${index}.results.${resIndex}.value`) ?? ""}
                        onChange={(e) => {
                          const normalized = warnAndNormalizeDecimalInput(e.target.value);
                          form.setValue(`parameters.${index}.results.${resIndex}.value`, normalized, { shouldDirty: true });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Koefisien Internal */}
              {coeffType && (
                <div className="border-t border-slate-100 pt-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800">Koefisien Internal ({coeffType})</Label>
                    <span className="text-[10px] text-slate-400 font-medium">Formula kalibrasi instrumen</span>
                  </div>
                  <div className="grid min-w-0 grid-cols-2 sm:grid-cols-3 gap-2">
                    {form.watch(`parameters.${index}.coefficients`)?.map((coeff, coeffIndex) => (
                      <div key={coeffIndex} className="flex min-w-0 items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-lg border border-slate-200/70">
                        <span className="w-6 text-[11px] font-bold uppercase text-slate-600 bg-slate-200/80 rounded py-0.5 text-center shrink-0">{coeff.key}</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="h-7 min-w-0 w-full text-xs bg-white border-slate-300 px-2 shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="0,00"
                          value={form.watch(`parameters.${index}.coefficients.${coeffIndex}.value`) ?? ""}
                          onChange={(e) => {
                            const normalized = warnAndNormalizeDecimalInput(e.target.value);
                            form.setValue(`parameters.${index}.coefficients.${coeffIndex}.value`, normalized as any, { shouldDirty: true });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CRM Reference and Reading */}
              <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Nilai Referensi CRM</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Standar CRM (mis: 5,51)"
                    disabled={paramName?.toLowerCase() === "ph"}
                    className="h-8 min-w-0 w-full text-xs bg-white border-slate-300 shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    value={form.watch(`parameters.${index}.crmReferenceValue`) ?? ""}
                    onChange={(e) => {
                      const normalized = warnAndNormalizeDecimalInput(e.target.value);
                      form.setValue(`parameters.${index}.crmReferenceValue`, normalized as any, { shouldDirty: true });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Nilai Pembacaan CRM</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Hasil baca CRM (mis: 5,48)"
                    disabled={paramName?.toLowerCase() === "ph"}
                    className="h-8 min-w-0 w-full text-xs bg-white border-slate-300 shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    value={form.watch(`parameters.${index}.crmReadingValue`) ?? ""}
                    onChange={(e) => {
                      const normalized = warnAndNormalizeDecimalInput(e.target.value);
                      form.setValue(`parameters.${index}.crmReadingValue`, normalized as any, { shouldDirty: true });
                    }}
                  />
                </div>
              </div>

              {/* Documentation / Foto */}
              {calibrationId && ensurePersistedDetail && (
                <CalibrationDocumentation
                  calibrationId={calibrationId}
                  parameterId={field.parameterId}
                  detailId={detailId}
                  documentation={documentationByParameter[field.parameterId] ?? {}}
                  readOnly={status === "Approved"}
                  ensurePersistedDetail={ensurePersistedDetail}
                  onBusyChange={(photoType, busy) => onDocumentationBusyChange?.(field.parameterId, photoType, busy)}
                />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
