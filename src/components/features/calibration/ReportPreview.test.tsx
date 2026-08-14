import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Toaster } from "sonner";
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
  status: "Approved",
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
  parameters: [
    {
      id: 1,
      parameterId: "do",
      parameterName: "DO",
      parameterUnit: "mg/L",
      spec: "",
      coeffType: "K/B",
      crmReferenceValue: null,
      crmReadingValue: null,
      remark: null,
      results: [
        {
          id: 1,
          standardName: "0",
          standardValue: 0,
          minAcceptable: null,
          maxAcceptable: null,
          value: "0",
        },
      ],
      coefficients: [],
      status: "PASS",
    },
  ],
  waterSamples: [],
  notes: "Kalibrasi dilakukan sesuai prosedur.",
};

describe("ReportPreview", () => {
  let downloadedFilename: string | undefined;

  beforeEach(() => {
    downloadedFilename = undefined;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:calibration-report"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadedFilename = this.download;
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("menampilkan laporan dengan tanggal, standar, dan istilah Indonesia", () => {
    render(<ReportPreview detail={calibrationDetail} />);

    expect(screen.getByText("LAPORAN KALIBRASI")).toBeInTheDocument();
    expect(screen.getByText(/10–12 Agustus 2026/)).toBeInTheDocument();
    expect(
      screen.getByText(/Morowali Utara, 12 Agustus 2026/),
    ).toBeInTheDocument();
    expect(screen.getByText("0,00 mg/L")).toBeInTheDocument();
    expect(screen.getByText("Standar/CRM")).toBeInTheDocument();
    expect(screen.getByAltText("Logo CMC")).toBeInTheDocument();
    expect(screen.queryByText("(Hunting)")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Calibration|Report|Station|Standart|Notes|Print|Download/i),
    ).not.toBeInTheDocument();
  });

  it("mengunduh laporan dengan nama berkas Indonesia", async () => {
    vi.spyOn(calibrationService, "downloadPdf").mockResolvedValue(new Blob(["PDF"]));

    render(<ReportPreview detail={calibrationDetail} />);
    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));

    await waitFor(() => {
      expect(downloadedFilename).toBe("Laporan_Kalibrasi_KAL_2026_001.pdf");
    });
  });

  it("menampilkan pemberitahuan saat unduhan laporan gagal", async () => {
    vi.spyOn(calibrationService, "downloadPdf").mockRejectedValue(new Error("Jaringan gagal"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<><ReportPreview detail={calibrationDetail} /><Toaster /></>);
    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));

    expect(await screen.findByText("PDF laporan kalibrasi gagal diunduh.")).toBeInTheDocument();
  });
});
