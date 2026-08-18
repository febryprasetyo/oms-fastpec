import { describe, expect, it } from "vitest";
import { validateCalibrationDocumentationForSubmit } from "./calibration-documentation";

const before = {
  id: "doc-1", calibrationDetailId: 11, parameterId: "1", photoType: "before" as const,
  previewUrl: "https://api.test/before", mimeType: "image/webp", size: 100,
  uploadedAt: "2026-08-18T00:00:00.000Z",
};

describe("validateCalibrationDocumentationForSubmit", () => {
  it("requires Before for every parameter while allowing every After slot to remain empty", () => {
    expect(validateCalibrationDocumentationForSubmit([
      { parameterId: "1", documentation: { before } },
      { parameterId: "2", documentation: {} },
    ], false)).toEqual({
      valid: false,
      missingBeforeParameterIds: ["2"],
      reason: "Foto Before Calibration wajib tersedia untuk setiap parameter.",
    });

    expect(validateCalibrationDocumentationForSubmit([
      { parameterId: "1", documentation: { before } },
    ], false)).toEqual({ valid: true, missingBeforeParameterIds: [] });
  });

  it("blocks submission while any documentation operation is active", () => {
    expect(validateCalibrationDocumentationForSubmit([
      { parameterId: "1", documentation: { before } },
    ], true)).toEqual({
      valid: false,
      missingBeforeParameterIds: [],
      reason: "Tunggu sampai seluruh proses foto selesai sebelum mengajukan kalibrasi.",
    });
  });
});
