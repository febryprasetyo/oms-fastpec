"use client";

import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const initialized = useRef(false);
  const saving = useRef(false);
  const activeSave = useRef<Promise<boolean> | null>(null);
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
    initialized.current = true;
  }, [detail, form]);

  const save = useCallback(async (showToast = false): Promise<boolean> => {
    if (!detail || detail.status !== "Draft") return true;
    if (activeSave.current) {
      const previousSaveSucceeded = await activeSave.current;
      if (!previousSaveSucceeded) return false;
    }
    if (!form.formState.isDirty) return true;
    const parsed = CalibrationSchema.safeParse(form.getValues());
    if (!parsed.success) {
      toast.error(formatCalibrationValidationError(parsed.error));
      return false;
    }
    const snapshot = parsed.data;
    const serializedSnapshot = JSON.stringify(snapshot);
    const hasNewSamples = snapshot.waterSamples.some((sample) => !sample.id);
    const request = (async () => {
      saving.current = true; setSaveState("saving");
      try {
        await updateMutation.mutateAsync({ id, data: toUpdateCalibrationPayload(snapshot) });
        const unchangedDuringSave = JSON.stringify(form.getValues()) === serializedSnapshot;
        if (unchangedDuringSave) form.reset(snapshot);
        setSaveState("saved");
        if (hasNewSamples || unchangedDuringSave) {
          if (unchangedDuringSave) initialized.current = false;
          await refetch();
        }
        if (showToast) toast.success("Draf tersimpan.");
        return true;
      } catch { setSaveState("error"); return false; }
      finally { saving.current = false; activeSave.current = null; }
    })();
    activeSave.current = request;
    return request;
  }, [detail, form, id, refetch, updateMutation]);

  useEffect(() => {
    if (!initialized.current || !form.formState.isDirty || detail?.status !== "Draft") return;
    const timer = window.setTimeout(() => void save(false), 1500);
    return () => window.clearTimeout(timer);
  }, [values, form.formState.isDirty, detail?.status, save]);

  const changeParameters = async (parameterId: string) => {
    if (!detail || detail.status !== "Draft" || saving.current) return;
    const current = form.getValues("parameters").map((parameter) => parameter.parameterId);
    const next = current.includes(parameterId) ? current.filter((item) => item !== parameterId) : [...current, parameterId];
    if (next.length === 0) return toast.error("Minimal satu parameter harus dipilih.");
    saving.current = true; setSaveState("saving");
    try {
      await updateMutation.mutateAsync({ id, data: { parameter_ids: next.map(Number) } });
      initialized.current = false; await refetch(); setSaveState("saved");
    } catch { setSaveState("error"); }
    finally { saving.current = false; }
  };

  const submit = async () => {
    const missing = form.getValues("parameters").some((parameter) => parameter.results.some((result) => result.value.trim() === ""));
    if (missing) return toast.error("Seluruh hasil kalibrasi standar wajib diisi.");
    const missingCoefficients = form.getValues("parameters").some((parameter) => parameter.coeffType && parameter.coefficients.some((coefficient) => coefficient.value === undefined || !Number.isFinite(Number(coefficient.value))));
    if (missingCoefficients) return toast.error("Seluruh nilai koefisien K/B wajib diisi untuk parameter yang memiliki koefisien.");
    if (activeSave.current && !(await activeSave.current)) return;
    if (!(await save(false))) return;
    try { await submitMutation.mutateAsync(id); toast.success("Kalibrasi berhasil diajukan."); router.push(`/calibration/${id}`); } catch { /* interceptor handles message */ }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat kalibrasi...</div>;
  if (!detail) return <div className="p-8 text-center text-destructive">Kalibrasi tidak ditemukan.</div>;
  const editable = detail.status === "Draft";
  const completion = values?.parameters?.length ? Math.round(values.parameters.flatMap((parameter) => parameter.results).filter((result) => result.value !== "").length / Math.max(1, values.parameters.flatMap((parameter) => parameter.results).length) * 100) : 0;

  return <div className="mx-auto max-w-6xl space-y-6 p-6">
    <CalibrationHeader reportNo={detail.reportNo} officer={detail.officer} calibrationStartDate={detail.calibrationStartDate} calibrationEndDate={detail.calibrationEndDate} status={detail.status} completionPercentage={completion} />
    {!editable && <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">Laporan berstatus {translateCalibrationStatus(detail.status)} dan tidak dapat diedit.</div>}
    <Card><CardContent className="grid gap-4 p-6 md:grid-cols-2">
      <div><Label>Stasiun</Label><Input readOnly value={detail.stationName} /></div><div><Label>Petugas</Label><Input readOnly value={detail.officer} /></div>
      <div><Label>Alamat</Label><Input readOnly value={detail.address} /></div><div><Label>Koordinat</Label><Input readOnly value={`Lintang ${detail.latitude} | Bujur ${detail.longitude}`} /></div>
      <div><Label>Tanggal Mulai</Label><Input disabled={!editable} type="date" value={values.calibrationStartDate ? formatCalibrationDateInput(values.calibrationStartDate) : ""} onChange={(event) => form.setValue("calibrationStartDate", new Date(`${event.target.value}T00:00:00`), { shouldDirty: true })} /></div>
      <div><Label>Tanggal Selesai</Label><Input disabled={!editable} type="date" value={values.calibrationEndDate ? formatCalibrationDateInput(values.calibrationEndDate) : ""} onChange={(event) => form.setValue("calibrationEndDate", new Date(`${event.target.value}T00:00:00`), { shouldDirty: true })} /></div>
    </CardContent></Card>
    {editable && <Card><CardContent className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-5">{masterParameters.map((parameter) => <Button key={parameter.id} type="button" variant={values.parameters?.some((item) => item.parameterId === parameter.id) ? "default" : "outline"} onClick={() => void changeParameters(parameter.id)}>{formatCalibrationParameterName(parameter.name)}</Button>)}</CardContent></Card>}
    <fieldset disabled={!editable} className="space-y-6"><ParameterTable form={form} /><WaterSampleTable form={form} /><NotesEditor value={values.notes || ""} onChange={(notes) => form.setValue("notes", notes, { shouldDirty: true })} /></fieldset>
    {editable && <div className="flex items-center justify-end gap-3 border-t pt-4"><span className="mr-auto text-xs text-muted-foreground">{saveState === "saving" ? "Menyimpan..." : saveState === "saved" ? "Tersimpan" : saveState === "error" ? "Gagal menyimpan" : ""}</span><Button variant="outline" onClick={() => void save(true)}>Simpan Draf</Button><Button onClick={() => void submit()} disabled={submitMutation.isPending}>Ajukan Kalibrasi</Button></div>}
  </div>;
}
