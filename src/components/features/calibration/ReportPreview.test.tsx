import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
} as CalibrationDetail;

describe("ReportPreview", () => {
  const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
  let downloadedFilename: string | undefined;
  let downloadedHref: string | undefined;

  beforeEach(() => {
    downloadedFilename = undefined;
    downloadedHref = undefined;
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("menampilkan PDF backend yang sama sebagai pratinjau", async () => {
    render(<ReportPreview detail={calibrationDetail} />);

    expect(screen.getByText("Memuat pratinjau laporan kalibrasi...")).toBeInTheDocument();
    const iframe = await screen.findByTitle("Pratinjau laporan kalibrasi");

    expect(iframe).toHaveAttribute("src", "blob:shared-calibration-report");
  });

  it("mencetak PDF laporan di dalam iframe", async () => {
    render(<ReportPreview detail={calibrationDetail} />);
    const iframe = await screen.findByTitle("Pratinjau laporan kalibrasi");
    const print = vi.spyOn((iframe as HTMLIFrameElement).contentWindow!, "print").mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Cetak" }));

    expect(print).toHaveBeenCalledOnce();
  });

  it("mengunduh artefak PDF yang sedang ditampilkan", async () => {
    render(<ReportPreview detail={calibrationDetail} />);
    const iframe = await screen.findByTitle("Pratinjau laporan kalibrasi");

    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));

    await waitFor(() => {
      expect(downloadedFilename).toBe("Laporan_Kalibrasi_KAL_2026_001.pdf");
      expect(downloadedHref).toBe(iframe.getAttribute("src"));
    });
  });

  it("menampilkan pesan saat PDF laporan gagal dimuat", async () => {
    vi.mocked(calibrationService.downloadPdf).mockRejectedValue(new Error("Jaringan gagal"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ReportPreview detail={calibrationDetail} />);

    expect(await screen.findByText("Pratinjau laporan kalibrasi gagal dimuat.")).toBeInTheDocument();
  });
});
