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
      coefficients: [
        { key: "k", value: 1.413 },
        { key: "b", value: 5.4 },
      ],
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
    expect(screen.getByText(/K:/).closest("div")).toHaveTextContent("K: 1,41");
    expect(screen.getByText(/B:/).closest("div")).toHaveTextContent("B: 5,40");
    expect(screen.getByText("Standar/CRM")).toBeInTheDocument();
    expect(screen.getByAltText("Logo CMC")).toBeInTheDocument();
    expect(screen.queryByText("(Hunting)")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Calibration|Report|Station|Standart|Notes|Print|Download/i),
    ).not.toBeInTheDocument();
  });

  it("membersihkan catatan berbahaya sambil mempertahankan pemformatan yang diizinkan", () => {
    const { container } = render(
      <ReportPreview
        detail={{
          ...calibrationDetail,
          notes: '<p onclick="alert(1)">Aman <strong data-secret="x">tebal</strong><img src="x" onerror="alert(2)"><script>alert(3)</script><a href="javascript:alert(4)">tautan</a></p><ul style="color:red"><li>Butir</li></ul>',
        }}
      />,
    );

    expect(screen.getByText("tebal").tagName).toBe("STRONG");
    expect(screen.getByText("tebal")).not.toHaveAttribute("data-secret");
    expect(screen.getByText("Aman", { exact: false }).closest("p")).not.toHaveAttribute("onclick");
    expect(screen.getByText("Butir").closest("ul")).not.toHaveAttribute("style");
    const notes = container.querySelector(".calibration-notes-preview");
    expect(notes?.querySelector("script, img, a, svg")).toBeNull();
  });

  it("menampilkan nama kimia Indonesia beserta formula bakunya", () => {
    const chemicalParameters = [
      { ...calibrationDetail.parameters[0], id: 2, parameterId: "10", parameterName: "Amonia", results: [], coefficients: [] },
      { ...calibrationDetail.parameters[0], id: 3, parameterId: "11", parameterName: "Nitrat", results: [], coefficients: [], coeffType: undefined },
      { ...calibrationDetail.parameters[0], id: 4, parameterId: "12", parameterName: "Nitrit", results: [], coefficients: [], coeffType: undefined },
    ];

    render(<ReportPreview detail={{ ...calibrationDetail, parameters: chemicalParameters }} />);

    expect(screen.getAllByText("Amonia (NH3-N)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nitrat (NO3-N)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nitrit (NO2-N)").length).toBeGreaterThan(0);
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
