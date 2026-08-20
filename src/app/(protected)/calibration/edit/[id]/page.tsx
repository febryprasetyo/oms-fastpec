"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalibrationSchema, formatCalibrationValidationError, parseDecimalNumber, type CalibrationFormValues } from "@/schemas/calibration.schema";
import type { CalibrationDetail, CalibrationPhotoType } from "@/types/calibration";
import { toUpdateCalibrationPayload } from "@/lib/calibration-payload";
import { validateCalibrationDocumentationForSubmit } from "@/lib/calibration-documentation";
import { formatCalibrationDateInput, formatCalibrationParameterName, translateCalibrationStatus } from "@/lib/calibration-format";
import { useCalibrationDetail, useParameters, useSubmitCalibration, useUpdateCalibration } from "@/hook/useCalibration";
import { ParameterTable } from "@/components/features/calibration/ParameterTable";
import { WaterSampleTable } from "@/components/features/calibration/WaterSampleTable";
import { NotesEditor } from "@/components/features/calibration/NotesEditor";
import { CalibrationHeader } from "@/components/features/badge/CalibrationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, CheckCircle2, Plus, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

import { formatDecimalToComma } from "@/lib/decimal-input";

export default function EditCalibrationPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: detail, isLoading, refetch } = useCalibrationDetail(id);
  const { data: masterParameters = [] } = useParameters();
  const updateMutation = useUpdateCalibration();
  const submitMutation = useSubmitCalibration();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const initialized = useRef(false);
  const initializedSnapshot = useRef("");
  const saving = useRef(false);
  const saveInFlight = useRef<Promise<boolean> | null>(null);
  const authoritativeDetail = useRef<CalibrationDetail>();
  const [documentationBusyKeys, setDocumentationBusyKeys] = useState<Set<string>>(() => new Set());
  const [invalidDocumentationParameterIds, setInvalidDocumentationParameterIds] = useState<string[]>([]);
  const form = useForm<CalibrationFormValues>({ resolver: zodResolver(CalibrationSchema) });
  const values = form.watch();

  useEffect(() => {
    authoritativeDetail.current = detail;
    if (!detail || (initialized.current && JSON.stringify(form.getValues()) !== initializedSnapshot.current)) return;
    const initialValues: CalibrationFormValues = {
      stationId: detail.stationId,
      stationName: detail.stationName,
      address: detail.address,
      latitude: detail.latitude,
      longitude: detail.longitude,
      calibrationStartDate: new Date(`${detail.calibrationStartDate}T00:00:00`),
      calibrationEndDate: new Date(`${detail.calibrationEndDate}T00:00:00`),
      officer: detail.officer,
      parameters: detail.parameters.map(({ documentation: _documentation, ...parameter }) => ({
        ...parameter,
        crmReferenceValue: formatDecimalToComma(parameter.crmReferenceValue) as any,
        crmReadingValue: formatDecimalToComma(parameter.crmReadingValue) as any,
        results: parameter.results.map((res) => ({
          ...res,
          value: formatDecimalToComma(res.value),
        })),
        coefficients: parameter.coefficients.map((coeff) => ({
          ...coeff,
          value: formatDecimalToComma(coeff.value) as any,
        })),
      })),
      waterSamples: detail.waterSamples.map((sample) => ({
        ...sample,
        temperature: formatDecimalToComma(sample.temperature) as any,
        ph: formatDecimalToComma(sample.ph) as any,
        doValue: formatDecimalToComma(sample.doValue) as any,
        turbidity: formatDecimalToComma(sample.turbidity) as any,
        tds: formatDecimalToComma(sample.tds) as any,
        orp: formatDecimalToComma(sample.orp) as any,
        tss: formatDecimalToComma(sample.tss) as any,
        bod: formatDecimalToComma(sample.bod) as any,
        cod: formatDecimalToComma(sample.cod) as any,
        nh3: formatDecimalToComma(sample.nh3) as any,
        no3: formatDecimalToComma(sample.no3) as any,
        no2: formatDecimalToComma(sample.no2) as any,
        depth: formatDecimalToComma(sample.depth) as any,
      })),
      notes: detail.notes,
    };
    form.reset(initialValues);
    initializedSnapshot.current = JSON.stringify(initialValues);
    initialized.current = true;
  }, [detail, form]);

  const selectedParameterIds = values.parameters?.map((parameter) => parameter.parameterId) ?? [];

  const performSave = async (showToast = false): Promise<boolean> => {
    if (!detail || detail.status === "Approved") return true;
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
    const serializedSnapshot = JSON.stringify(snapshot);
    saving.current = true; setSaveState("saving");
    try {
      await updateMutation.mutateAsync({ id, data: toUpdateCalibrationPayload(snapshot) });
      const currentValues = CalibrationSchema.safeParse(form.getValues());
      if (!currentValues.success || JSON.stringify(currentValues.data) !== serializedSnapshot) {
        setSaveState("idle");
        return false;
      }
      form.reset(snapshot);
      initialized.current = false;
      const refreshed = await refetch();
      if (refreshed.data) authoritativeDetail.current = refreshed.data;
      setSaveState("saved");
      if (showToast) toast.success(detail.status === "Draft" ? "Draf tersimpan." : "Perubahan laporan tersimpan.");
      return true;
    } catch { setSaveState("error"); return false; }
    finally { saving.current = false; }
  };

  const save = (showToast = false): Promise<boolean> => {
    if (saveInFlight.current) return saveInFlight.current;
    const operation = performSave(showToast);
    saveInFlight.current = operation;
    void operation.finally(() => {
      if (saveInFlight.current === operation) saveInFlight.current = null;
    });
    return operation;
  };

  const ensurePersistedDetail = async (parameterId: string): Promise<number> => {
    const current = form.getValues("parameters").find((parameter) => parameter.parameterId === parameterId);
    if (current && current.id > 0) return current.id;
    if (!(await save(false))) throw new Error("Parameter belum berhasil disimpan. Coba lagi.");
    let persisted = authoritativeDetail.current?.parameters.find((parameter) => parameter.parameterId === parameterId);
    if (!persisted || persisted.id <= 0) {
      const refreshed = await refetch();
      if (refreshed.data) authoritativeDetail.current = refreshed.data;
      persisted = refreshed.data?.parameters.find((parameter) => parameter.parameterId === parameterId);
    }
    if (!persisted || persisted.id <= 0) throw new Error("ID parameter belum tersedia setelah penyimpanan.");
    return persisted.id;
  };

  const setDocumentationBusy = (parameterId: string, photoType: CalibrationPhotoType, busy: boolean) => {
    const key = `${parameterId}:${photoType}`;
    setDocumentationBusyKeys((current) => {
      const next = new Set(current);
      if (busy) next.add(key); else next.delete(key);
      return next;
    });
  };

  const changeParameters = async (parameterId: string) => {
    if (!detail || detail.status === "Approved" || saving.current) return;
    const current = form.getValues("parameters");
    const existing = current.find((parameter) => parameter.parameterId === parameterId);
    if (existing && current.length === 1) return toast.error("Minimal satu parameter harus dipilih.");
    const master = masterParameters.find((parameter) => parameter.id === parameterId);
    if (!existing && !master) return;
    const normalizedName = master?.name.trim().toLowerCase() ?? "";
    const coeffType = normalizedName === "ph" ? "K1-K6" as const
      : ["nitrat", "nitrit", "no3", "no2"].includes(normalizedName) ? undefined
        : "K/B" as const;
    const next = existing ? current.filter((parameter) => parameter.parameterId !== parameterId) : [...current, {
      id: 0, parameterId, parameterName: master!.name, parameterUnit: master!.unit, spec: master!.spec,
      coeffType, crmReferenceValue: null, crmReadingValue: null, remark: null,
      results: (master!.standards ?? []).map((standard) => ({ id: 0, standardName: standard.crmName, standardValue: standard.standardValue, minAcceptable: null, maxAcceptable: null, value: "" })),
      coefficients: (coeffType === "K1-K6" ? ["k1", "k2", "k3", "k4", "k5", "k6"] : coeffType === "K/B" ? ["k", "b"] : []).map((key) => ({ key, value: undefined })),
      status: null,
    }];
    form.setValue("parameters", next, { shouldDirty: true });
    setSaveState("idle");
  };

  const cancel = () => {
    if (form.formState.isDirty && !window.confirm("Batalkan seluruh perubahan yang belum disimpan?")) return;
    router.push(`/calibration/${id}`);
  };

  const submit = async () => {
    const currentParameterIds = form.getValues("parameters").map((parameter) => parameter.parameterId);
    const documentationValidation = validateCalibrationDocumentationForSubmit(
      currentParameterIds.map((parameterId) => ({
        parameterId,
        documentation: detail?.parameters.find((parameter) => parameter.parameterId === parameterId)?.documentation ?? {},
      })),
      documentationBusyKeys.size > 0,
    );
    setInvalidDocumentationParameterIds(documentationValidation.missingBeforeParameterIds);
    if (!documentationValidation.valid) {
      toast.error(documentationValidation.reason);
      const firstMissingId = documentationValidation.missingBeforeParameterIds[0];
      if (firstMissingId) {
        const card = document.querySelector<HTMLElement>(`[data-calibration-parameter-id="${CSS.escape(firstMissingId)}"]`);
        const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        card?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
        card?.focus({ preventScroll: true });
      }
      return;
    }
    const missing = form.getValues("parameters").some((parameter) =>
      parameter.results.some((result) => {
        const parsed = parseDecimalNumber(result.value);
        return result.value.trim() === "" || parsed === undefined || Number.isNaN(parsed);
      })
    );
    if (missing) return toast.error("Seluruh hasil kalibrasi standar wajib diisi.");
    const missingCoefficients = form.getValues("parameters").some((parameter) =>
      parameter.coeffType && parameter.coefficients.some((coefficient) => {
        const parsed = parseDecimalNumber(coefficient.value);
        return coefficient.value === undefined || parsed === undefined || Number.isNaN(parsed);
      })
    );
    if (missingCoefficients) return toast.error("Seluruh nilai koefisien K/B wajib diisi untuk parameter yang memiliki koefisien.");
    if (!(await save(false))) return;
    try { await submitMutation.mutateAsync(id); toast.success("Kalibrasi berhasil diajukan."); router.push(`/calibration/${id}`); } catch { /* interceptor handles message */ }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat kalibrasi...</div>;
  if (!detail) return <div className="p-8 text-center text-destructive">Kalibrasi tidak ditemukan.</div>;
  const editable = detail.status !== "Approved";
  const completion = values?.parameters?.length ? Math.round(values.parameters.flatMap((parameter) => parameter.results).filter((result) => result.value !== "").length / Math.max(1, values.parameters.flatMap((parameter) => parameter.results).length) * 100) : 0;

  return (
    <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header Bar */}
      <CalibrationHeader
        reportNo={detail.reportNo}
        officer={detail.officer}
        calibrationStartDate={detail.calibrationStartDate}
        calibrationEndDate={detail.calibrationEndDate}
        status={detail.status}
        completionPercentage={completion}
      />

      {!editable && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 shadow-xs">
          Laporan berstatus {translateCalibrationStatus(detail.status)} dan tidak dapat diedit.
        </div>
      )}

      {/* Informasi Stasiun & Tanggal Kalibrasi */}
      <Card className="min-w-0 rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-3 px-4 sm:px-5">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <span>Informasi Stasiun & Rentang Waktu Kalibrasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-5">
          {/* Metadata Stasiun Read-Only */}
          <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
            <div>
              <p className="text-[11px] font-medium text-slate-500">Nama Stasiun</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{detail.stationName || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Petugas Kalibrasi</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{detail.officer || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Alamat Lokasi</p>
              <p className="text-xs text-slate-700 mt-0.5 truncate" title={detail.address}>{detail.address || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Koordinat GPS</p>
              <p className="text-[11px] font-mono font-medium text-slate-700 mt-0.5 truncate">
                {detail.latitude && detail.longitude ? `${detail.latitude}, ${detail.longitude}` : "-"}
              </p>
            </div>
          </div>

          {/* Input Rentang Tanggal Kalibrasi */}
          <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Tanggal Mulai Kalibrasi</Label>
              <Input
                disabled={!editable}
                type="date"
                className="h-8 text-xs bg-white border-slate-300 text-slate-900 shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={values.calibrationStartDate ? formatCalibrationDateInput(values.calibrationStartDate) : ""}
                onChange={(event) => form.setValue("calibrationStartDate", new Date(`${event.target.value}T00:00:00`), { shouldDirty: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Tanggal Selesai Kalibrasi</Label>
              <Input
                disabled={!editable}
                type="date"
                className="h-8 text-xs bg-white border-slate-300 text-slate-900 shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={values.calibrationEndDate ? formatCalibrationDateInput(values.calibrationEndDate) : ""}
                onChange={(event) => form.setValue("calibrationEndDate", new Date(`${event.target.value}T00:00:00`), { shouldDirty: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameter Selection Cards */}
      {editable && (
        <Card className="min-w-0 rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-3 px-4 sm:px-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Pilih Parameter Kalibrasi yang Diuji</span>
            </CardTitle>
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
              {selectedParameterIds.length} dipilih
            </span>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="grid min-w-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {masterParameters.map((parameter) => {
                const isSelected = selectedParameterIds.includes(parameter.id);
                return (
                  <button
                    key={parameter.id}
                    type="button"
                    className={cn(
                      "flex items-center justify-between h-9 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs hover:bg-blue-700"
                        : "bg-slate-100/80 text-slate-700 border-slate-200/90 hover:bg-slate-200/80 hover:border-slate-300"
                    )}
                    onClick={() => void changeParameters(parameter.id)}
                  >
                    <span className="truncate">{formatCalibrationParameterName(parameter.name)}</span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 ml-1.5 text-white" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0 ml-1.5 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulir Parameter, Sampel Air, & Catatan */}
      <fieldset disabled={!editable} className="space-y-6 min-w-0">
        <ParameterTable
          form={form}
          calibrationId={id}
          status={detail.status}
          documentationByParameter={Object.fromEntries(detail.parameters.map((parameter) => [parameter.parameterId, parameter.documentation]))}
          ensurePersistedDetail={ensurePersistedDetail}
          onDocumentationBusyChange={setDocumentationBusy}
          invalidDocumentationParameterIds={invalidDocumentationParameterIds}
        />

        <WaterSampleTable form={form} />

        <NotesEditor
          value={values.notes || ""}
          onChange={(notes) => form.setValue("notes", notes, { shouldDirty: true })}
        />
      </fieldset>

      {/* Sticky Bottom Action Bar */}
      {editable && (
        <div className="sticky bottom-4 z-20 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-lg backdrop-blur-md ring-1 ring-slate-900/5">
          <span className="text-xs text-center sm:text-left text-slate-500 font-medium">
            {saveState === "saving" ? "⏳ Menyimpan perubahan..." : saveState === "saved" ? "✓ Seluruh perubahan tersimpan" : saveState === "error" ? "⚠ Gagal menyimpan perubahan" : ""}
          </span>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={cancel}
              className="flex-1 sm:flex-none text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Batalkan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void save(true)}
              disabled={saving.current}
              className="flex-1 sm:flex-none text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              {detail.status === "Draft" ? "Simpan Draf" : "Simpan Perubahan"}
            </Button>
            {detail.status === "Draft" && (
              <Button
                size="sm"
                onClick={() => void submit()}
                disabled={submitMutation.isPending || saving.current || documentationBusyKeys.size > 0}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs"
              >
                Ajukan Kalibrasi
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
