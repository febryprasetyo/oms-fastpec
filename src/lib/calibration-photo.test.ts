import { describe, expect, it } from "vitest";
import {
  CALIBRATION_PHOTO_MAX_BYTES,
  getCompressionAttempts,
  selectCompressedPhoto,
  validateCalibrationPhotoFile,
} from "./calibration-photo";

describe("calibration photo compression policy", () => {
  it("rejects files outside the supported gallery image formats", () => {
    const file = new File(["gif"], "photo.gif", { type: "image/gif" });

    expect(() => validateCalibrationPhotoFile(file)).toThrow(
      "Pilih foto berformat JPEG, PNG, atau WebP.",
    );
  });

  it("uses bounded quality attempts before reducing resolution", () => {
    expect(getCompressionAttempts()).toEqual([
      { maxDimension: 1600, quality: 0.75 },
      { maxDimension: 1600, quality: 0.68 },
      { maxDimension: 1600, quality: 0.6 },
      { maxDimension: 1440, quality: 0.6 },
      { maxDimension: 1280, quality: 0.6 },
      { maxDimension: 1120, quality: 0.6 },
    ]);
  });

  it("selects the first target-sized result without enlarging a small source", () => {
    const result = selectCompressedPhoto([
      new Blob([new Uint8Array(180_000)], { type: "image/webp" }),
      new Blob([new Uint8Array(140_000)], { type: "image/webp" }),
      new Blob([new Uint8Array(120_000)], { type: "image/webp" }),
    ]);

    expect(result.size).toBe(140_000);
  });

  it("accepts the smallest bounded result and rejects anything above 250 KB", () => {
    const accepted = selectCompressedPhoto([
      new Blob([new Uint8Array(260_000)], { type: "image/webp" }),
      new Blob([new Uint8Array(CALIBRATION_PHOTO_MAX_BYTES)], { type: "image/webp" }),
    ]);
    expect(accepted.size).toBe(CALIBRATION_PHOTO_MAX_BYTES);

    expect(() => selectCompressedPhoto([
      new Blob([new Uint8Array(260_000)], { type: "image/webp" }),
      new Blob([new Uint8Array(255_001)], { type: "image/webp" }),
    ])).toThrow("Foto masih lebih besar dari 250 KB setelah dikompresi.");
  });
});
