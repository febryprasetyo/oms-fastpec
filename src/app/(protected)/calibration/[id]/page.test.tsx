import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CalibrationDetail } from "@/types/calibration";
import CalibrationDetailPage from "./page";

const { mutateAsync, toastError, toastSuccess, useApproveCalibration, useCalibrationAuth, useCalibrationDetail } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  useApproveCalibration: vi.fn(),
  useCalibrationAuth: vi.fn(),
  useCalibrationDetail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "calibration-1" }),
}));

vi.mock("@/hook/useCalibration", () => ({
  useApproveCalibration,
  useCalibrationAuth,
  useCalibrationDetail,
}));

vi.mock("@/components/features/calibration/ReportPreview", () => ({
  ReportPreview: () => <div>Pratinjau laporan kalibrasi</div>,
}));

vi.mock("@/components/features/calibration/QRCodeCard", () => ({
  QRCodeCard: () => <div>Kode QR verifikasi</div>,
}));

vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

const calibrationDetail: CalibrationDetail = {
  id: "calibration-1",
  reportNo: "KAL/2026/001",
  stationId: "station-1",
  stationName: "Stasiun Pemantauan Bahoea Reko-Reko",
  address: "Kabupaten Morowali Utara",
  stationCity: "Kabupaten Morowali Utara",
  latitude: -2.1234,
  longitude: 121.5678,
  calibrationStartDate: "2026-08-10",
  calibrationEndDate: "2026-08-12",
  calibrationDate: "2026-08-10 – 2026-08-12",
  contactPerson: "",
  phone: "",
  officer: "Budi Santoso",
  status: "Submitted",
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
  parameters: [],
  waterSamples: [],
  notes: "Kalibrasi dilakukan sesuai prosedur.",
};

describe("CalibrationDetailPage", () => {
  beforeEach(() => {
    mutateAsync.mockResolvedValue(undefined);
    useApproveCalibration.mockReturnValue({ mutateAsync });
    useCalibrationAuth.mockReturnValue({ role: "adm" });
    useCalibrationDetail.mockReturnValue({ data: calibrationDetail, isLoading: false });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("menampilkan tindakan persetujuan dalam bahasa Indonesia", () => {
    render(<CalibrationDetailPage />);

    expect(screen.getByRole("button", { name: "Setujui Kalibrasi" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve Calibration" })).not.toBeInTheDocument();
  });

  it("memberi notifikasi persetujuan dalam bahasa Indonesia", async () => {
    render(<CalibrationDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: "Setujui Kalibrasi" }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Laporan kalibrasi berhasil disetujui."));
  });

  it("memberi notifikasi gagal menyetujui dalam bahasa Indonesia", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("Jaringan gagal"));
    render(<CalibrationDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: "Setujui Kalibrasi" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Laporan kalibrasi tidak dapat disetujui."));
  });

  it("menampilkan keadaan laporan tidak ditemukan dalam bahasa Indonesia", () => {
    useCalibrationDetail.mockReturnValue({ data: undefined, isLoading: false });
    render(<CalibrationDetailPage />);

    expect(screen.getByText("Laporan kalibrasi tidak ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan dokumentasi parameter tanpa kontrol upload", () => {
    useCalibrationDetail.mockReturnValue({
      data: {
        ...calibrationDetail,
        parameters: [{
          id: 11, parameterId: "1", parameterName: "DO", spec: "", crmReferenceValue: null,
          crmReadingValue: null, remark: null, results: [], coefficients: [], status: null,
          documentation: {
            before: {
              id: "doc-before", calibrationDetailId: 11, parameterId: "1", photoType: "before",
              previewUrl: "https://api.test/before?signed", mimeType: "image/webp", size: 100,
              uploadedAt: "2026-08-18T00:00:00.000Z",
            },
          },
        }],
      },
      isLoading: false,
    });

    render(<CalibrationDetailPage />);

    expect(screen.getByRole("heading", { name: "Dokumentasi Kalibrasi DO" })).toBeInTheDocument();
    expect(screen.getByText("After Calibration: tidak didokumentasikan")).toBeInTheDocument();
    expect(screen.queryByText("Pilih dari galeri")).not.toBeInTheDocument();
  });
});
