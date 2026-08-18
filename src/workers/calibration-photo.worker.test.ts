import { describe, expect, it, vi } from "vitest";
import { processCalibrationPhoto } from "./calibration-photo.worker";

describe("calibration photo worker processing", () => {
  it("normalizes orientation, contains dimensions, strips source metadata, and releases decoding resources", async () => {
    const close = vi.fn();
    const bitmap = { width: 4000, height: 3000, close } as unknown as ImageBitmap;
    const createImageBitmap = vi.fn().mockResolvedValue(bitmap);
    const drawImage = vi.fn();
    const convertToBlob = vi.fn()
      .mockResolvedValueOnce(new Blob([new Uint8Array(170_000)], { type: "image/webp" }))
      .mockResolvedValueOnce(new Blob([new Uint8Array(140_000)], { type: "image/webp" }));
    const createCanvas = vi.fn((width: number, height: number) => ({
      width,
      height,
      getContext: () => ({ drawImage }),
      convertToBlob,
    }));

    const result = await processCalibrationPhoto(
      new File(["jpeg-with-exif"], "field.jpg", { type: "image/jpeg" }),
      { createImageBitmap, createCanvas },
    );

    expect(createImageBitmap).toHaveBeenCalledWith(expect.any(File), { imageOrientation: "from-image" });
    expect(createCanvas).toHaveBeenNthCalledWith(1, 1600, 1200);
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 1600, 1200);
    expect(convertToBlob).toHaveBeenNthCalledWith(1, { type: "image/webp", quality: 0.75 });
    expect(convertToBlob).toHaveBeenNthCalledWith(2, { type: "image/webp", quality: 0.68 });
    expect(result).toMatchObject({ blob: expect.any(Blob), width: 1600, height: 1200 });
    expect(result.blob.size).toBe(140_000);
    expect(close).toHaveBeenCalledOnce();
  });

  it("does not upscale a source image smaller than the maximum dimensions", async () => {
    const bitmap = { width: 800, height: 600, close: vi.fn() } as unknown as ImageBitmap;
    const createCanvas = vi.fn(() => ({
      getContext: () => ({ drawImage: vi.fn() }),
      convertToBlob: () => Promise.resolve(new Blob([new Uint8Array(90_000)], { type: "image/webp" })),
    }));

    const result = await processCalibrationPhoto(
      new File(["png"], "field.png", { type: "image/png" }),
      { createImageBitmap: vi.fn().mockResolvedValue(bitmap), createCanvas },
    );

    expect(createCanvas).toHaveBeenCalledWith(800, 600);
    expect(result).toMatchObject({ width: 800, height: 600 });
  });
});
