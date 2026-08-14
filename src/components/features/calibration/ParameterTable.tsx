import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { CalibrationFormValues } from "@/schemas/calibration.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParameterTableProps {
  form: UseFormReturn<CalibrationFormValues>;
}

export const ParameterTable: React.FC<ParameterTableProps> = ({ form }) => {
  const { control, register } = form;
  const { fields } = useFieldArray({
    control,
    name: "parameters",
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {fields.map((field, index) => {
        const paramName = form.watch(`parameters.${index}.parameterName`);
        const spec = form.watch(`parameters.${index}.spec`);
        const coeffType = form.watch(`parameters.${index}.coeffType`);

        return (
          <Card key={field.id} className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-800">
                <span>{paramName} Kalibrasi</span>
                <span className="text-xs font-normal text-slate-500">
                  Spesifikasi: {spec}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-600 block mb-2">
                  Hasil Kalibrasi (Standar)
                </Label>
                <div className="space-y-3">
                  {form.watch(`parameters.${index}.results`)?.map((res, resIndex) => (
                    <div key={resIndex} className="grid grid-cols-2 gap-2 items-center">
                      <span className="text-xs font-medium text-slate-500">{res.standardName}</span>
                      <Input
                        size={28}
                        className="h-8 text-xs"
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
                <div className="grid grid-cols-2 gap-2">
                  {form.watch(`parameters.${index}.coefficients`)?.map((coeff, coeffIndex) => (
                    <div key={coeffIndex} className="flex items-center gap-2">
                      <span className="w-8 text-xs font-semibold uppercase text-slate-500">{coeff.key}:</span>
                      <Input
                        type="number"
                        step="any"
                        className="h-8 text-xs"
                        {...register(`parameters.${index}.coefficients.${coeffIndex}.value` as const)}
                      />
                    </div>
                  ))}
                </div>
              </div>}
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div><Label className="text-xs">Nilai Referensi CRM</Label><Input type="number" step="any" disabled={paramName.toLowerCase() === "ph"} {...register(`parameters.${index}.crmReferenceValue` as const)} /></div>
                <div><Label className="text-xs">Nilai Pembacaan CRM</Label><Input type="number" step="any" disabled={paramName.toLowerCase() === "ph"} {...register(`parameters.${index}.crmReadingValue` as const)} /></div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
