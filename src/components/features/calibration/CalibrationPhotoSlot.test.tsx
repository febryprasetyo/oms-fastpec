import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalibrationPhotoSlot } from "./CalibrationPhotoSlot";

const compressCalibrationPhoto = vi.hoisted(() => vi.fn());
vi.mock("@/lib/calibration-photo", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/calibration-photo")>(),
  compressCalibrationPhoto,
}));

describe("CalibrationPhotoSlot", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.restoreAllMocks();
    compressCalibrationPhoto.mockReset();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:local-preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("selects supported gallery files without requesting direct camera capture", () => {
    render(<CalibrationPhotoSlot label="Before Calibration" required readOnly={false} onUpload={vi.fn()} />);

    const input = screen.getByLabelText("Pilih foto Before Calibration");
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(input).not.toHaveAttribute("capture");
    expect(screen.getByText("Wajib")).toBeInTheDocument();
  });

  it("compresses, uploads, and revokes the local preview after server reconciliation", async () => {
    const compressed = new File(["webp"], "before.webp", { type: "image/webp" });
    compressCalibrationPhoto.mockResolvedValue(compressed);
    const onUpload = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <CalibrationPhotoSlot label="Before Calibration" required readOnly={false} onUpload={onUpload} />,
    );

    fireEvent.change(screen.getByLabelText("Pilih foto Before Calibration"), {
      target: { files: [new File(["jpeg"], "field.jpg", { type: "image/jpeg" })] },
    });

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(compressed, expect.any(Function)));
    expect(screen.getByAltText("Pratinjau Before Calibration")).toHaveAttribute("src", "blob:local-preview");

    rerender(<CalibrationPhotoSlot
      label="Before Calibration"
      required
      readOnly={false}
      documentation={{
        id: "doc-1", calibrationDetailId: 1, parameterId: "7", photoType: "before",
        previewUrl: "https://api.test/signed-before", mimeType: "image/webp", size: 100,
        uploadedAt: "2026-08-18T00:00:00.000Z",
      }}
      onUpload={onUpload}
    />);

    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-preview"));
    expect(screen.getByAltText("Pratinjau Before Calibration")).toHaveAttribute("src", "https://api.test/signed-before");
  });

  it("shows read-only previews without mutation actions", () => {
    render(<CalibrationPhotoSlot
      label="After Calibration"
      readOnly
      documentation={{
        id: "doc-2", calibrationDetailId: 1, parameterId: "7", photoType: "after",
        previewUrl: "https://api.test/signed-after", mimeType: "image/webp", size: 100,
        uploadedAt: "2026-08-18T00:00:00.000Z",
      }}
      onUpload={vi.fn()}
      onDelete={vi.fn()}
    />);

    expect(screen.queryByRole("button", { name: /hapus|ganti|coba lagi/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Pilih foto After Calibration")).not.toBeInTheDocument();
  });
});
