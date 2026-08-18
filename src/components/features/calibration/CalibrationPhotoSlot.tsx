"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CALIBRATION_PHOTO_ACCEPT, compressCalibrationPhoto } from "@/lib/calibration-photo";
import type { CalibrationDocumentation } from "@/types/calibration";

type Phase = "idle" | "compressing" | "uploading" | "deleting" | "error";

interface CalibrationPhotoSlotProps {
  label: string;
  required?: boolean;
  readOnly: boolean;
  documentation?: CalibrationDocumentation;
  onUpload: (file: File, onProgress: (percent?: number) => void) => Promise<void>;
  onDelete?: () => Promise<void>;
  onBusyChange?: (busy: boolean) => void;
}

export function CalibrationPhotoSlot({
  label,
  required = false,
  readOnly,
  documentation,
  onUpload,
  onDelete,
  onBusyChange,
}: CalibrationPhotoSlotProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string>();
  const retryFile = useRef<File>();
  const localPreviewRef = useRef<string>();

  const clearLocalPreview = () => {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    localPreviewRef.current = undefined;
    setLocalPreview(undefined);
  };

  useEffect(() => {
    if (documentation && localPreviewRef.current) clearLocalPreview();
  }, [documentation]);

  useEffect(() => () => {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
  }, []);

  const setOperationPhase = (next: Phase) => {
    setPhase(next);
    onBusyChange?.(["compressing", "uploading", "deleting"].includes(next));
  };

  const upload = async (file: File) => {
    retryFile.current = file;
    setError("");
    setProgress(undefined);
    clearLocalPreview();
    const preview = URL.createObjectURL(file);
    localPreviewRef.current = preview;
    setLocalPreview(preview);
    try {
      setOperationPhase("compressing");
      const compressed = await compressCalibrationPhoto(file);
      setOperationPhase("uploading");
      await onUpload(compressed, setProgress);
      setOperationPhase("idle");
      retryFile.current = undefined;
    } catch (uploadError) {
      setOperationPhase("error");
      setError(uploadError instanceof Error ? uploadError.message : "Foto gagal diunggah.");
    }
  };

  const remove = async () => {
    if (!onDelete) return;
    setError("");
    try {
      setOperationPhase("deleting");
      await onDelete();
      clearLocalPreview();
      setOperationPhase("idle");
    } catch (deleteError) {
      setOperationPhase("error");
      setError(deleteError instanceof Error ? deleteError.message : "Foto gagal dihapus.");
    }
  };

  const previewUrl = localPreview || documentation?.previewUrl;
  const busy = ["compressing", "uploading", "deleting"].includes(phase);

  return <section className="min-w-0 space-y-3 rounded-lg border bg-white p-3">
    <div className="flex items-center justify-between gap-2">
      <h4 className="text-xs font-semibold text-slate-700">{label}</h4>
      {required && <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">Wajib</span>}
    </div>

    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border border-dashed bg-slate-50">
      {previewUrl
        ? <img src={previewUrl} alt={`Pratinjau ${label}`} className="h-full w-full object-contain" />
        : <div className="px-3 text-center text-xs text-slate-500">Belum ada foto</div>}
    </div>

    {phase !== "idle" && phase !== "error" && <p className="text-xs text-slate-600" role="status">
      {phase === "compressing" && "Mengompresi foto…"}
      {phase === "uploading" && `Mengunggah foto${progress === undefined ? "…" : ` ${progress}%`}`}
      {phase === "deleting" && "Menghapus foto…"}
    </p>}
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}

    {!readOnly && <div className="flex flex-wrap gap-2">
      <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-xs font-medium hover:bg-slate-50">
        <ImagePlus className="mr-2 h-4 w-4" />
        {documentation || localPreview ? "Ganti foto" : "Pilih dari galeri"}
        <input
          className="sr-only"
          type="file"
          accept={CALIBRATION_PHOTO_ACCEPT}
          aria-label={`Pilih foto ${label}`}
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      {phase === "error" && retryFile.current && <Button type="button" size="sm" variant="outline" onClick={() => void upload(retryFile.current!)}>
        <RefreshCw className="mr-2 h-4 w-4" />Coba lagi
      </Button>}
      {documentation && onDelete && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void remove()}>
        <Trash2 className="mr-2 h-4 w-4" />Hapus
      </Button>}
    </div>}
  </section>;
}
