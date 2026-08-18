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

const calibrationDetail = {
  id: "calibration-1",
  reportNo: "KAL/2026/001",
  parameters: [],
  waterSamples: [],
} as unknown as CalibrationDetail;

describe("ReportPreview", () => {
  const renderedHtml = "<!doctype html><html><body><h1>LAPORAN KALIBRASI</h1><p>10–12 Agustus 2026</p><p>0,00 mg/L</p></body></html>";
  let downloadedFilename: string | undefined;

  beforeEach(() => {
    downloadedFilename = undefined;
    vi.spyOn(calibrationService, "getReportPreviewHtml").mockResolvedValue(renderedHtml);
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

  it("menampilkan dokumen HTML yang dirender backend tanpa memformat ulang data", async () => {
    render(<ReportPreview detail={calibrationDetail} />);

    expect(screen.getByText("Memuat pratinjau laporan kalibrasi...")).toBeInTheDocument();
    const iframe = await screen.findByTitle("Pratinjau laporan kalibrasi");

    expect(iframe).toHaveAttribute("srcdoc", renderedHtml);
  });

  it("mencetak dokumen laporan di dalam iframe", async () => {
    render(<ReportPreview detail={calibrationDetail} />);
    const iframe = await screen.findByTitle("Pratinjau laporan kalibrasi");
    const print = vi.spyOn((iframe as HTMLIFrameElement).contentWindow!, "print").mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Cetak" }));

    expect(print).toHaveBeenCalledOnce();
  });

  it("menampilkan pesan saat HTML pratinjau gagal dimuat", async () => {
    vi.mocked(calibrationService.getReportPreviewHtml).mockRejectedValue(new Error("Jaringan gagal"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ReportPreview detail={calibrationDetail} />);

    expect(await screen.findByText("Pratinjau laporan kalibrasi gagal dimuat.")).toBeInTheDocument();
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
