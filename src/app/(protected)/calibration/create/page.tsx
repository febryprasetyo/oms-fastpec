"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarDays, Check, X } from "lucide-react";
import { calibrationParameterConfigs } from "@/config/calibration-parameters";
import { ParameterTable } from "@/components/features/calibration/ParameterTable";
import { WaterSampleTable } from "@/components/features/calibration/WaterSampleTable";
import { NotesEditor } from "@/components/features/calibration/NotesEditor";
import { CalibrationHeader } from "@/components/features/badge/CalibrationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calibrationService } from "@/services/api/calibration";
import { toCreateCalibrationDraftPayload, toUpdateCalibrationPayload } from "@/lib/calibration-payload";
import { CalibrationSchema, type CalibrationFormValues } from "@/schemas/calibration.schema";
import { useCalibrationAuth, useCreateCalibration, useStations, useUpdateCalibration } from "@/hook/useCalibration";
import { toast } from "sonner";

const createParameterValue = (parameterId: string): CalibrationFormValues["parameters"][number] => {
  const config = calibrationParameterConfigs.find((parameter) => parameter.id === parameterId);
  if (!config) throw new Error("Unknown calibration parameter");

  return {
    parameterId: config.id,
    parameterName: config.name,
    spec: config.standards.map((standard) => `${standard.minAcceptable}-${standard.maxAcceptable} ${config.unit}`).join(" | "),
    coeffType: config.coefficientType,
    remark: null,
    results: config.standards.map((standard) => ({
      standardName: standard.crmName,
      standardValue: standard.standardValue,
      minAcceptable: standard.minAcceptable,
      maxAcceptable: standard.maxAcceptable,
      value: "",
    })),
    coefficients: config.coefficientKeys.map((key) => ({ key, value: 0 })),
    status: "PASS",
  };
};

export default function CreateCalibrationPage() {
  const router = useRouter();
  const { token, officerName } = useCalibrationAuth();
  const { data: stations = [], isLoading: isStationsLoading, isError: isStationsError } = useStations();
  const createMutation = useCreateCalibration();
  const updateMutation = useUpdateCalibration();
  const [draftId, setDraftId] = useState<string>();
  const [stationSearch, setStationSearch] = useState("");
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const stationPickerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CalibrationFormValues>({
    resolver: zodResolver(CalibrationSchema),
    defaultValues: {
      stationId: "", stationName: "", address: "", latitude: 0, longitude: 0,
      calibrationDate: new Date(), contactPerson: "", phone: "", officer: officerName,
      parameters: [], waterSamples: [{ sampleName: "Aquades (Blank)" }], notes: "",
    },
  });
  const values = form.watch();
  const matchingStations = useMemo(
    () => stations.filter((station) => station.name.toLowerCase().includes(stationSearch.toLowerCase())).slice(0, 8),
    [stationSearch, stations],
  );
  const completion = [values.stationId, values.contactPerson, values.phone, values.parameters.length > 0].filter(Boolean).length * 25;

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      if (!draftId) {
        const created = await createMutation.mutateAsync(toCreateCalibrationDraftPayload(form.getValues()));
        const detail = await calibrationService.getCalibrationById(created.id, token);
        form.reset({
          stationId: detail.stationId, stationName: detail.stationName, address: detail.address,
          latitude: detail.latitude, longitude: detail.longitude, calibrationDate: new Date(detail.calibrationDate),
          contactPerson: detail.contactPerson, phone: detail.phone, officer: detail.officer || officerName,
          parameters: detail.parameters, waterSamples: detail.waterSamples, notes: detail.notes,
        });
        setDraftId(created.id);
        await updateMutation.mutateAsync({ id: created.id, data: toUpdateCalibrationPayload(form.getValues()) });
        form.reset(form.getValues());
        toast.success("Calibration berhasil disimpan");
        return created.id;
      } else {
        await updateMutation.mutateAsync({ id: draftId, data: toUpdateCalibrationPayload(form.getValues()) });
      }
      form.reset(form.getValues());
      toast.success("Calibration berhasil disimpan");
      return draftId;
    } catch {
      toast.error("Draft belum dapat disimpan. Lengkapi informasi wajib terlebih dahulu.");
      return undefined;
    } finally {
      setIsSaving(false);
    }
  }, [createMutation, draftId, form, officerName, token, updateMutation]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (draftId && form.formState.isDirty && !isSaving) void saveDraft();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [draftId, form.formState.isDirty, isSaving, saveDraft]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [form.formState.isDirty]);

  useEffect(() => {
    const closeStationPicker = (event: MouseEvent) => {
      if (!stationPickerRef.current?.contains(event.target as Node)) setIsStationMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsStationMenuOpen(false);
    };
    document.addEventListener("mousedown", closeStationPicker);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", closeStationPicker);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectStation = (stationId: string) => {
    const station = stations.find((item) => item.id === stationId);
    if (!station) return;
    form.setValue("stationId", station.id, { shouldDirty: true });
    form.setValue("stationName", station.name, { shouldDirty: true });
    form.setValue("address", station.address, { shouldDirty: true });
    form.setValue("latitude", station.latitude, { shouldDirty: true });
    form.setValue("longitude", station.longitude, { shouldDirty: true });
    setStationSearch(station.name);
    setIsStationMenuOpen(false);
  };

  const toggleParameter = (parameterId: string) => {
    const current = form.getValues("parameters");
    const exists = current.some((parameter) => parameter.parameterId === parameterId);
    form.setValue("parameters", exists ? current.filter((parameter) => parameter.parameterId !== parameterId) : [...current, createParameterValue(parameterId)], { shouldDirty: true });
  };

  const submit = async () => {
    const id = await saveDraft();
    if (id) router.push(`/calibration/edit/${id}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <CalibrationHeader reportNo="Draft" officer={values.officer} calibrationDate={values.calibrationDate?.toLocaleDateString() || ""} status="Draft" completionPercentage={completion} />
      <Card className="bg-slate-50/80 dark:bg-slate-900/40"><CardHeader><CardTitle>General Information</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div ref={stationPickerRef} className="space-y-2 md:col-span-2"><Label>Station</Label><Input value={stationSearch} onFocus={() => setIsStationMenuOpen(true)} onChange={(event) => { setStationSearch(event.target.value); setIsStationMenuOpen(true); }} placeholder="Ketik nama stasiun..." />
          {isStationMenuOpen && <div className="max-h-56 overflow-y-auto rounded-md border bg-background p-1 shadow-md">{isStationsLoading ? <p className="px-3 py-2 text-sm text-muted-foreground">Memuat stasiun...</p> : isStationsError ? <p className="px-3 py-2 text-sm text-destructive">Gagal memuat daftar stasiun.</p> : matchingStations.length > 0 ? matchingStations.map((station) => <button key={station.id} type="button" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted" onMouseDown={(event) => { event.preventDefault(); selectStation(station.id); }}>{station.name}</button>) : <p className="px-3 py-2 text-sm text-muted-foreground">Stasiun tidak ditemukan.</p>}</div>}</div>
        <div className="space-y-2"><Label>Station Name</Label><Input readOnly value={values.stationName} /></div>
        <div className="space-y-2"><Label>Coordinate</Label><Input readOnly value={values.stationId ? `${values.latitude}, ${values.longitude}` : ""} /></div>
        <div className="space-y-2"><Label>Address</Label><Input readOnly value={values.address} /></div>
        <div className="space-y-2"><Label>Calibration Date</Label><div className="relative"><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" type="date" value={values.calibrationDate ? values.calibrationDate.toISOString().slice(0, 10) : ""} onChange={(event) => form.setValue("calibrationDate", new Date(event.target.value), { shouldDirty: true })} /></div></div>
        <div className="space-y-2"><Label>Contact Person</Label><Input {...form.register("contactPerson")} /></div><div className="space-y-2"><Label>Phone</Label><Input {...form.register("phone")} /></div>
        <div className="space-y-2"><Label>Officer</Label><Input readOnly value={values.officer} /></div>
      </CardContent></Card>
      <Card className="bg-slate-50/80 dark:bg-slate-900/40"><CardHeader><CardTitle>Parameter Calibration</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{calibrationParameterConfigs.map((parameter) => { const selected = values.parameters.some((item) => item.parameterId === parameter.id); return <button key={parameter.id} type="button" onClick={() => toggleParameter(parameter.id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm ${selected ? "border-primary bg-primary/5" : "bg-background hover:bg-muted"}`}>{selected ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground" />}<span>{parameter.name}</span></button>; })}</CardContent></Card>
      <ParameterTable form={form} /><WaterSampleTable form={form} /><NotesEditor value={values.notes || ""} onChange={(notes) => form.setValue("notes", notes, { shouldDirty: true })} />
      <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="button" variant="outline" disabled={isSaving} onClick={() => void saveDraft()}>Save Draft</Button><Button type="button" disabled={isSaving} onClick={() => void submit()}>Continue to Review</Button></div>
    </div>
  );
}
