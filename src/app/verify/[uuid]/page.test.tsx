import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CalibrationDetail } from "@/types/calibration";
import VerificationPage from "./page";

const { useCalibrationVerify } = vi.hoisted(() => ({
  useCalibrationVerify: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ uuid: "verification-1" }),
}));

vi.mock("@/hook/useCalibration", () => ({
  useCalibrationVerify,
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
      results: [],
      coefficients: [],
      status: "PASS",
      documentation: {},
    },
  ],
  waterSamples: [
    {
      id: "sample-1",
      sampleName: "Sampel Outlet",
      temperature: 26.5,
      ph: 7,
      doValue: 5.4,
      turbidity: 1.25,
      tds: 120,
    },
  ],
  notes: "Kalibrasi dilakukan sesuai prosedur.",
};

describe("VerificationPage", () => {
  beforeEach(() => {
    useCalibrationVerify.mockReturnValue({
      data: calibrationDetail,
      isLoading: false,
      error: null,
    });
  });

  afterEach(cleanup);

  it("menampilkan laporan terverifikasi dengan istilah dan format Indonesia", () => {
    render(<VerificationPage />);

    expect(screen.getByText("Laporan Kalibrasi Autentik")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("10–12 Agustus 2026")).toBeInTheDocument();
    expect(screen.getByText("Status Parameter Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Lulus")).toBeInTheDocument();
    expect(screen.getByText("26,50")).toBeInTheDocument();
    expect(
      screen.queryByText(/Authentic|Verified|Report Number|Station Name|Calibration Date|Notes|Water Samples|Sample|Temp|Turbidity/i),
    ).not.toBeInTheDocument();
  });

  it("membersihkan catatan berbahaya sambil mempertahankan pemformatan yang diizinkan", () => {
    useCalibrationVerify.mockReturnValueOnce({
      data: {
        ...calibrationDetail,
        notes: '<p onclick="alert(1)">Aman <em data-secret="x">miring</em><img src="x" onerror="alert(2)"><script>alert(3)</script><a href="javascript:alert(4)">tautan</a></p><ol style="color:red"><li>Butir</li></ol>',
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<VerificationPage />);

    expect(screen.getByText("miring").tagName).toBe("EM");
    expect(screen.getByText("miring")).not.toHaveAttribute("data-secret");
    expect(screen.getByText("Aman", { exact: false }).closest("p")).not.toHaveAttribute("onclick");
    expect(screen.getByText("Butir").closest("ol")).not.toHaveAttribute("style");
    const notes = container.querySelector(".calibration-notes-preview");
    expect(notes?.querySelector("script, img, a, svg")).toBeNull();
  });

  it("membedakan gaya dan label status lulus, tidak lulus, dan menunggu", () => {
    const baseParameter = calibrationDetail.parameters[0];
    useCalibrationVerify.mockReturnValueOnce({
      data: {
        ...calibrationDetail,
        parameters: [
          { ...baseParameter, id: 1, parameterName: "Amonia", status: "PASS" },
          { ...baseParameter, id: 2, parameterName: "Nitrat", status: "FAILED" },
          { ...baseParameter, id: 3, parameterName: "Nitrit", status: null },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(<VerificationPage />);

    expect(screen.getByText("Amonia")).toBeInTheDocument();
    expect(screen.getByText("Nitrat")).toBeInTheDocument();
    expect(screen.getByText("Lulus")).toHaveClass("text-green-700", "font-bold");
    expect(screen.getByText("Tidak Lulus")).toHaveClass("text-red-700", "font-bold");
    expect(screen.getByText("Menunggu")).toHaveClass("text-slate-500", "font-medium");
  });

  it("menampilkan keadaan memverifikasi dan gagal dalam bahasa Indonesia", () => {
    useCalibrationVerify.mockReturnValueOnce({ data: undefined, isLoading: true, error: null });
    const { rerender } = render(<VerificationPage />);

    expect(screen.getByText("Memverifikasi keaslian laporan...")).toBeInTheDocument();

    useCalibrationVerify.mockReturnValueOnce({ data: undefined, isLoading: false, error: new Error("Tidak ditemukan") });
    rerender(<VerificationPage />);

    expect(screen.getByText("Verifikasi Gagal")).toBeInTheDocument();
    expect(screen.getByText(/Sertifikat kalibrasi ini tidak dapat diverifikasi/)).toBeInTheDocument();
  });
});
