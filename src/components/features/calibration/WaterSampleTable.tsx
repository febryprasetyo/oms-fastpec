import React from "react";
import { type Path, type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CalibrationFormValues } from "@/schemas/calibration.schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCalibrationParameterName } from "@/lib/calibration-format";

interface WaterSampleTableProps { form: UseFormReturn<CalibrationFormValues>; }

type SampleField = "temperature" | "doValue" | "tds" | "turbidity" | "ph" | "cod" | "bod" | "tss" | "nh3" | "no3" | "no2" | "orp" | "depth";
type SampleColumn = { field: SampleField; label: string; parameterNames?: string[] };

const sampleColumns: SampleColumn[] = [
  { field: "temperature", label: "Suhu (°C)" },
  { field: "doValue", label: "DO (mg/L)", parameterNames: ["do"] },
  { field: "tds", label: "TDS (mg/L)", parameterNames: ["tds"] },
  { field: "turbidity", label: "Kekeruhan (NTU)", parameterNames: ["turbidity"] },
  { field: "ph", label: "Satuan pH", parameterNames: ["ph"] },
  { field: "cod", label: "COD (mg/L)", parameterNames: ["cod"] },
  { field: "bod", label: "BOD (mg/L)", parameterNames: ["bod"] },
  { field: "tss", label: "TSS (mg/L)", parameterNames: ["tss"] },
  { field: "nh3", label: `${formatCalibrationParameterName("Amonia")} (mg/L)`, parameterNames: ["amonia", "nh3", "nh3-n"] },
  { field: "no3", label: `${formatCalibrationParameterName("Nitrat")} (mg/L)`, parameterNames: ["nitrat", "no3", "no3-n"] },
  { field: "no2", label: `${formatCalibrationParameterName("Nitrit")} (mg/L)`, parameterNames: ["nitrit", "no2", "no2-n"] },
  { field: "orp", label: "ORP (mV)", parameterNames: ["orp"] },
  { field: "depth", label: "Kedalaman (m)", parameterNames: ["kedalaman", "level", "depth"] },
];

export const WaterSampleTable: React.FC<WaterSampleTableProps> = ({ form }) => {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "waterSamples" });
  const parameters = useWatch({ control, name: "parameters" }) ?? [];
  const selectedNames = new Set(parameters.map((parameter) => parameter.parameterName.trim().toLowerCase()));
  const visibleColumns = sampleColumns.filter((column) => !column.parameterNames || column.parameterNames.some((name) => selectedNames.has(name)));

  const addSample = () => append({ sampleName: `Sampel Air (Sungai ${fields.length + 1})` });
  const deleteSample = (index: number) => {
    const sample = form.getValues(`waterSamples.${index}`);
    if (sample?.id && !window.confirm(`Hapus sampel “${sample.sampleName}”? Perubahan akan disimpan ke server.`)) return;
    remove(index);
  };

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Pengukuran Sampel Air dan Uji Blangko</h3><Button type="button" variant="outline" size="sm" onClick={addSample} className="h-8 gap-1.5"><Plus className="h-4 w-4" />Tambah Sampel</Button></div>
    <p className="text-xs text-muted-foreground">Kolom pengukuran mengikuti parameter kalibrasi yang dipilih; suhu selalu ditampilkan.</p>
    <div className="overflow-x-auto rounded-md border bg-white">
      <Table style={{ minWidth: `${Math.max(560, 260 + visibleColumns.length * 120)}px` }}>
        <TableHeader><TableRow className="bg-slate-50"><TableHead className="w-[190px] font-bold text-slate-700">Jenis Sampel</TableHead>{visibleColumns.map((column) => <TableHead key={column.field} className="text-center font-bold text-slate-700">{column.label}</TableHead>)}<TableHead className="w-[56px] text-center">Tindakan</TableHead></TableRow></TableHeader>
        <TableBody>{fields.length === 0 ? <TableRow><TableCell colSpan={visibleColumns.length + 2} className="py-6 text-center text-muted-foreground">Belum ada sampel air. Klik Tambah Sampel untuk menambahkan.</TableCell></TableRow> : fields.map((field, index) => <TableRow key={field.id}>
          <TableCell><Input className="h-8 text-xs font-semibold" {...register(`waterSamples.${index}.sampleName`)} /></TableCell>
          {visibleColumns.map((column) => {
            const fieldPath = `waterSamples.${index}.${column.field}` as Path<CalibrationFormValues>;
            return <TableCell key={column.field}><Input type="number" step="any" className="mx-auto h-8 text-center text-xs" {...register(fieldPath)} /></TableCell>;
          })}
          <TableCell className="text-center"><Button type="button" variant="ghost" size="icon" onClick={() => deleteSample(index)} className="h-8 w-8 text-red-500 hover:text-red-700" aria-label={`Hapus ${form.getValues(`waterSamples.${index}.sampleName`)}`}><Trash2 className="h-4 w-4" /></Button></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </div>
  </div>;
};
