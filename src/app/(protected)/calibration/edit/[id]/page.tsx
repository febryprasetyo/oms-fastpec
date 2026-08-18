"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalibrationSchema, formatCalibrationValidationError, type CalibrationFormValues } from "@/schemas/calibration.schema";
import { toUpdateCalibrationPayload } from "@/lib/calibration-payload";
import { formatCalibrationDateInput, formatCalibrationParameterName, translateCalibrationStatus } from "@/lib/calibration-format";
import { useCalibrationDetail, useParameters, useSubmitCalibration, useUpdateCalibration } from "@/hook/useCalibration";
import { ParameterTable } from "@/components/features/calibration/ParameterTable";
import { WaterSampleTable } from "@/components/features/calibration/WaterSampleTable";
import { NotesEditor } from "@/components/features/calibration/NotesEditor";
import { CalibrationHeader } from "@/components/features/badge/CalibrationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditCalibrationPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: detail, isLoading, refetch } = useCalibrationDetail(id);
  const { data: masterParameters = [] } = useParameters();
  const updateMutation = useUpdateCalibration();
  const submitMutation = useSubmitCalibration();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selectedParameterIds, setSelectedParameterIds] = useState<string[]>([]);
  const initialized = useRef(false);
  const saving = useRef(false);
  const form = useForm<CalibrationFormValues>({ resolver: zodResolver(CalibrationSchema) });
  const values = form.watch();

  useEffect(() => {
    if (!detail || (initialized.current && form.formState.isDirty)) return;
    form.reset({
      stationId: detail.stationId, stationName: detail.stationName, address: detail.address,
      latitude: detail.latitude, longitude: detail.longitude,
      calibrationStartDate: new Date(`${detail.calibrationStartDate}T00:00:00`),
      calibrationEndDate: new Date(`${detail.calibrationEndDate}T00:00:00`), officer: detail.officer,
      parameters: detail.parameters, waterSamples: detail.waterSamples, notes: detail.notes,
    });
    setSelectedParameterIds(detail.parameters.map((parameter) => parameter.parameterId));
    initialized.current = true;
  }, [detail, form]);

  const originalParameterIds = detail?.parameters.map((parameter) => parameter.parameterId) ?? [];
  const parameterSelectionDirty = JSON.stringify(selectedParameterIds) !== JSON.stringify(originalParameterIds);

  const save = async (showToast = false): Promise<boolean> => {
    if (!detail || detail.status === "Approved") return true;
    if (!form.formState.isDirty && !parameterSelectionDirty) return true;
    if (selectedParameterIds.length === 0) {
      toast.error("Minimal satu parameter harus dipilih.");
      return false;
    }
    const parsed = CalibrationSchema.safeParse(form.getValues());
    if (!parsed.success) {
      toast.error(formatCalibrationValidationError(parsed.error));
      return false;
    }
    const snapshot = parsed.data;
    saving.current = true; setSaveState("saving");
    try {
      await updateMutation.mutateAsync({ id, data: { ...toUpdateCalibrationPayload(snapshot), parameter_ids: selectedParameterIds.map(Number) } });
      form.reset(snapshot);
      initialized.current = false;
      await refetch();
      setSaveState("saved");
      if (showToast) toast.success(detail.status === "Draft" ? "Draf tersimpan." : "Perubahan laporan tersimpan.");
      return true;
    } catch { setSaveState("error"); return false; }
    finally { saving.current = false; }
  };

  const changeParameters = async (parameterId: string) => {
    if (!detail || detail.status === "Approved" || saving.current) return;
    const next = selectedParameterIds.includes(parameterId) ? selectedParameterIds.filter((item) => item !== parameterId) : [...selectedParameterIds, parameterId];
    if (next.length === 0) return toast.error("Minimal satu parameter harus dipilih.");
    setSelectedParameterIds(next);
    setSaveState("idle");
  };

  const cancel = () => {
    if ((form.formState.isDirty || parameterSelectionDirty) && !window.confirm("Batalkan seluruh perubahan yang belum disimpan?")) return;
    router.push(`/calibration/${id}`);
  };

  const submit = async () => {
    const missing = form.getValues("parameters").some((parameter) => parameter.results.some((result) => result.value.trim() === ""));
    if (missing) return toast.error("Seluruh hasil kalibrasi standar wajib diisi.");
    const missingCoefficients = form.getValues("parameters").some((parameter) => parameter.coeffType && parameter.coefficients.some((coefficient) => coefficient.value === undefined || !Number.isFinite(Number(coefficient.value))));
    if (missingCoefficients) return toast.error("Seluruh nilai koefisien K/B wajib diisi untuk parameter yang memiliki koefisien.");
    if (!(await save(false))) return;
    try { await submitMutation.mutateAsync(id); toast.success("Kalibrasi berhasil diajukan."); router.push(`/calibration/${id}`); } catch { /* interceptor handles message */ }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat kalibrasi...</div>;
  if (!detail) return <div className="p-8 text-center text-destructive">Kalibrasi tidak ditemukan.</div>;
  const editable = detail.status !== "Approved";
  const completion = values?.parameters?.length ? Math.round(values.parameters.flatMap((parameter) => parameter.results).filter((result) => result.value !== "").length / Math.max(1, values.parameters.flatMap((parameter) => parameter.results).length) * 100) : 0;

  return <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 overflow-x-hidden p-6">
    <CalibrationHeader reportNo={detail.reportNo} officer={detail.officer} calibrationStartDate={detail.calibrationStartDate} calibrationEndDate={detail.calibrationEndDate} status={detail.status} completionPercentage={completion} />
    {!editable && <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">Laporan berstatus {translateCalibrationStatus(detail.status)} dan tidak dapat diedit.</div>}
    <Card><CardContent className="grid gap-4 p-6 md:grid-cols-2">
      <div><Label>Stasiun</Label><Input readOnly value={detail.stationName} /></div><div><Label>Petugas</Label><Input readOnly value={detail.officer} /></div>
      <div><Label>Alamat</Label><Input readOnly value={detail.address} /></div><div><Label>Koordinat</Label><Input readOnly value={`Lintang ${detail.latitude} | Bujur ${detail.longitude}`} /></div>
      <div><Label>Tanggal Mulai</Label><Input disabled={!editable} type="date" value={values.calibrationStartDate ? formatCalibrationDateInput(values.calibrationStartDate) : ""} onChange={(event) => form.setValue("calibrationStartDate", new Date(`${event.target.value}T00:00:00`), { shouldDirty: true })} /></div>
      <div><Label>Tanggal Selesai</Label><Input disabled={!editable} type="date" value={values.calibrationEndDate ? formatCalibrationDateInput(values.calibrationEndDate) : ""} onChange={(event) => form.setValue("calibrationEndDate", new Date(`${event.target.value}T00:00:00`), { shouldDirty: true })} /></div>
    </CardContent></Card>
    {editable && <Card className="min-w-0"><CardContent className="grid min-w-0 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-5">{masterParameters.map((parameter) => <Button key={parameter.id} type="button" variant={selectedParameterIds.includes(parameter.id) ? "default" : "outline"} onClick={() => void changeParameters(parameter.id)}>{formatCalibrationParameterName(parameter.name)}</Button>)}</CardContent></Card>}
    <fieldset disabled={!editable} className="space-y-6"><ParameterTable form={form} /><WaterSampleTable form={form} /><NotesEditor value={values.notes || ""} onChange={(notes) => form.setValue("notes", notes, { shouldDirty: true })} /></fieldset>
    {editable && <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-4"><span className="mr-auto text-xs text-muted-foreground">{saveState === "saving" ? "Menyimpan..." : saveState === "saved" ? "Tersimpan" : saveState === "error" ? "Gagal menyimpan" : ""}</span><Button variant="outline" onClick={cancel}>Batalkan</Button><Button variant="outline" onClick={() => void save(true)} disabled={saving.current}>{detail.status === "Draft" ? "Simpan Draf" : "Simpan Perubahan"}</Button>{detail.status === "Draft" && <Button onClick={() => void submit()} disabled={submitMutation.isPending || saving.current}>Ajukan Kalibrasi</Button>}</div>}
  </div>;
}
