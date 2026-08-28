import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calibrationService } from "@/services/api/calibration";
import type { CalibrationDetail } from "@/types/calibration";
import { ReportPreview } from "./ReportPreview";

vi.mock("@/hook/useCalibration", () => ({
  useCalibrationAuth: () => ({ token: "test-token" }),
}));

const calibrationDetail: CalibrationDetail = {
  id: "calibration-1",
  reportNo: "KAL/2026/001",
  stationId: "station-1",
  stationName: "Stasiun Bahoea Reko-Reko",
  address: "Kabupaten Morowali Utara",
  stationCity: "Kabupaten Morowali Utara",
  latitude: -2.1234,
  longitude: 121.5678,
  calibrationStartDate: "2026-08-10",
  calibrationEndDate: "2026-08-12",
  calibrationDate: "2026-08-10 – 2026-08-12",
  contactPerson: "Dinas LH",
  phone: "08123456789",
  officer: "Budi Santoso",
  status: "Submitted",
  createdAt: "2026-08-10T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
  parameters: [],
  waterSamples: [],
  notes: "Catatan pengujian",
};

describe("ReportPreview", () => {
  const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
  let downloadedFilename: string | undefined;
  let downloadedHref: string | undefined;
  let printSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    downloadedFilename = undefined;
    downloadedHref = undefined;
    printSpy = vi.fn();
    vi.spyOn(calibrationService, "downloadPdf").mockResolvedValue(pdf);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:shared-calibration-report"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadedFilename = this.download;
      downloadedHref = this.href;
    });
    vi.spyOn(window, "print").mockImplementation(printSpy);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("menampilkan dokumen kalibrasi secara native di frontend", async () => {
    render(<ReportPreview detail={calibrationDetail} />);

    expect(screen.getAllByText("PT Cahaya Mas Cemerlang")).toHaveLength(2);
    expect(screen.getByText("1. Kalibrasi Parameter Sensor")).toBeInTheDocument();
    expect(screen.getByText("2. Pengukuran Sampel Air dan Uji Blangko")).toBeInTheDocument();
  });

  it("mencetak dokumen kalibrasi saat tombol Cetak diklik", async () => {
    render(<ReportPreview detail={calibrationDetail} />);

    fireEvent.click(screen.getByRole("button", { name: "Cetak" }));

    expect(printSpy).toHaveBeenCalled();
  });

  it("mengunduh artefak PDF dari backend saat tombol Unduh PDF diklik", async () => {
    render(<ReportPreview detail={calibrationDetail} />);

    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));

    await waitFor(() => {
      expect(downloadedFilename).toBe("Laporan_Kalibrasi_KAL_2026_001.pdf");
      expect(downloadedHref).toBe("blob:shared-calibration-report");
    });
  });
});
