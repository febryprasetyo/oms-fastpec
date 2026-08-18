import { describe, expect, it } from "vitest";
import { getCalibrationDocumentationErrorMessage } from "./calibration-documentation-error";

describe("getCalibrationDocumentationErrorMessage", () => {
  it("maps storage exhaustion to a clear capacity message", () => {
    expect(getCalibrationDocumentationErrorMessage({ response: { status: 507, data: {} } }, "fallback")).toBe(
      "Kapasitas penyimpanan dokumentasi hampir penuh. Hubungi administrator sebelum mencoba lagi.",
    );
  });

  it("prefers a safe backend message and otherwise uses the local fallback", () => {
    expect(getCalibrationDocumentationErrorMessage({
      response: { status: 422, data: { message: "File gambar tidak valid." } },
    }, "fallback")).toBe("File gambar tidak valid.");
    expect(getCalibrationDocumentationErrorMessage(new Error("Request failed"), "Foto gagal diunggah.")).toBe("Foto gagal diunggah.");
  });
});
