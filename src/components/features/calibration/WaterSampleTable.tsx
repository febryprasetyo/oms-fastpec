import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { CalibrationFormValues } from "@/schemas/calibration.schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface WaterSampleTableProps {
  form: UseFormReturn<CalibrationFormValues>;
}

export const WaterSampleTable: React.FC<WaterSampleTableProps> = ({ form }) => {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "waterSamples",
  });

  const handleAddSample = () => {
    append({
      sampleName: `Water Sample (River #${fields.length + 1})`,
      temperature: undefined,
      ph: undefined,
      doValue: undefined,
      conductivity: undefined,
      tds: undefined,
      salinity: undefined,
      turbidity: undefined,
      cod: undefined,
      bod: undefined,
      tss: undefined,
      nh3: undefined,
      no3: undefined,
      orp: undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">2. Water Sample Measurement & Blank Test</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAddSample} className="h-8 gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Add Sample</span>
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[180px] font-bold text-slate-700">Sample Type</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Temp (°C)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">DO (mg/L)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">TDS (mg/L)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Turb (NTU)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">pH Unit</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">COD (mg/L)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">BOD (mg/L)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">TSS (mg/L)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">NH3-N (mg/L)</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">NO3-N (mg/L)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <Input
                    className="h-8 text-xs font-semibold"
                    {...register(`waterSamples.${index}.sampleName` as const)}
                  />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.temperature` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.doValue` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.tds` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.turbidity` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.ph` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.cod` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.bod` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.tss` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.nh3` as const)} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="any" className="h-8 text-xs text-center mx-auto" {...register(`waterSamples.${index}.no3` as const)} />
                </TableCell>
                <TableCell>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
