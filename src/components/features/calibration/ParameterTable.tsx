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
        const isPh = paramName.toLowerCase() === "ph";

        return (
          <Card key={field.id} className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-800">
                <span>{paramName} Calibration</span>
                <span className="text-xs font-normal text-slate-500">Spec: {spec}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Calibration Results */}
              <div>
                <Label className="text-xs font-bold text-slate-600 block mb-2">Calibration Results (Standards)</Label>
                <div className="space-y-3">
                  {form.watch(`parameters.${index}.results`)?.map((res, resIndex) => (
                    <div key={resIndex} className="grid grid-cols-2 gap-2 items-center">
                      <span className="text-xs font-medium text-slate-500">{res.standardName}</span>
                      <Input
                        size={28}
                        className="h-8 text-xs"
                        placeholder="Measured value"
                        {...register(`parameters.${index}.results.${resIndex}.value` as const)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Coefficients */}
              <div className="border-t pt-3">
                <Label className="text-xs font-bold text-slate-600 block mb-2">
                  Internal Coefficients ({isPh ? "K1 - K4" : "K / B"})
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {form.watch(`parameters.${index}.coefficients`)?.map((coeff, coeffIndex) => (
                    <div key={coeffIndex} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 w-8">{coeff.key}:</span>
                      <Input
                        type="number"
                        step="any"
                        className="h-8 text-xs"
                        {...register(`parameters.${index}.coefficients.${coeffIndex}.value` as const)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
