import type { ParameterCalibrationDocumentation } from "@/types/calibration";

interface DocumentationParameter {
  parameterId: string;
  documentation: ParameterCalibrationDocumentation;
}

type DocumentationValidationResult = {
  valid: boolean;
  missingBeforeParameterIds: string[];
  reason?: string;
};

export const validateCalibrationDocumentationForSubmit = (
  parameters: DocumentationParameter[],
  hasBusyOperation: boolean,
): DocumentationValidationResult => {
  const missingBeforeParameterIds = parameters
    .filter((parameter) => !parameter.documentation.before)
    .map((parameter) => parameter.parameterId);

  if (hasBusyOperation) {
    return {
      valid: false,
      missingBeforeParameterIds,
      reason: "Tunggu sampai seluruh proses foto selesai sebelum mengajukan kalibrasi.",
    };
  }
  if (missingBeforeParameterIds.length > 0) {
    return {
      valid: false,
      missingBeforeParameterIds,
      reason: "Foto Before Calibration wajib tersedia untuk setiap parameter.",
    };
  }
  return { valid: true, missingBeforeParameterIds: [] };
};
