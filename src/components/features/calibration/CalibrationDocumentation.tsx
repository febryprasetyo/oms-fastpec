"use client";

import React from "react";
import type { AxiosProgressEvent } from "axios";
import { CalibrationPhotoSlot } from "./CalibrationPhotoSlot";
import {
  useDeleteCalibrationDocumentation,
  useUploadCalibrationDocumentation,
} from "@/hook/useCalibration";
import type {
  CalibrationPhotoType,
  ParameterCalibrationDocumentation,
} from "@/types/calibration";

interface CalibrationDocumentationProps {
  calibrationId: string;
  parameterId: string;
  detailId: number;
  documentation: ParameterCalibrationDocumentation;
  readOnly: boolean;
  ensurePersistedDetail: (parameterId: string) => Promise<number>;
  onBusyChange?: (photoType: CalibrationPhotoType, busy: boolean) => void;
}

export function CalibrationDocumentation({
  calibrationId,
  parameterId,
  detailId,
  documentation,
  readOnly,
  ensurePersistedDetail,
  onBusyChange,
}: CalibrationDocumentationProps) {
  const uploadMutation = useUploadCalibrationDocumentation();
  const deleteMutation = useDeleteCalibrationDocumentation();

  const upload = (photoType: CalibrationPhotoType) => async (
    file: File,
    setProgress: (percent?: number) => void,
  ) => {
    const persistedDetailId = detailId > 0 ? detailId : await ensurePersistedDetail(parameterId);
    await uploadMutation.mutateAsync({
      calibrationId,
      detailId: persistedDetailId,
      parameterId,
      photoType,
      file,
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!event.total) return setProgress(undefined);
        setProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  };

  const remove = (photoType: CalibrationPhotoType) => async () => {
    if (detailId <= 0) throw new Error("Parameter belum tersimpan.");
    await deleteMutation.mutateAsync({ calibrationId, detailId, parameterId, photoType });
  };

  return <section className="space-y-3 border-t pt-4">
    <h3 className="text-xs font-bold text-slate-600">Calibration Documentation</h3>
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
      <CalibrationPhotoSlot
        label="Before Calibration"
        required
        readOnly={readOnly}
        documentation={documentation.before}
        onUpload={upload("before")}
        onDelete={documentation.before ? remove("before") : undefined}
        onBusyChange={(busy) => onBusyChange?.("before", busy)}
      />
      <CalibrationPhotoSlot
        label="After Calibration"
        readOnly={readOnly}
        documentation={documentation.after}
        onUpload={upload("after")}
        onDelete={documentation.after ? remove("after") : undefined}
        onBusyChange={(busy) => onBusyChange?.("after", busy)}
      />
    </div>
  </section>;
}
