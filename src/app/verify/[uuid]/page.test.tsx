import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
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

    expect(screen.getByText("Dokumen Terverifikasi")).toBeInTheDocument();
    expect(screen.getByText("Laporan Hasil Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("10–12 Agustus 2026")).toBeInTheDocument();
    expect(screen.getByText("Status Parameter Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Lulus")).toBeInTheDocument();
    expect(screen.getByText("26,50")).toBeInTheDocument();
    expect(
      screen.queryByText(/Authentic|Report Number|Station Name|Calibration Date|Notes|Water Samples|Sample|Temp|Turbidity/i),
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

  it("membedakan gaya dan label status lulus, tidak lulus, dan menunggu tanpa icon checklist", () => {
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

    const { container } = render(<VerificationPage />);

    const paramTable = container.querySelector(".parameter-table") as HTMLElement;
    expect(paramTable).toBeInTheDocument();
    expect(within(paramTable).getByText("Amonia")).toBeInTheDocument();
    expect(within(paramTable).getByText("Nitrat")).toBeInTheDocument();
    expect(within(paramTable).getByText("Nitrit")).toBeInTheDocument();

    const passElem = within(paramTable).getByText("Lulus");
    const failElem = within(paramTable).getByText("Tidak Lulus");
    const pendingElem = within(paramTable).getByText("Menunggu");

    expect(passElem).toHaveClass("text-green-700", "font-bold");
    expect(failElem).toHaveClass("text-red-700", "font-bold");
    expect(pendingElem).toHaveClass("text-slate-500", "font-medium");

    // Verify no SVG icons inside parameter table status cells
    expect(paramTable.querySelector("svg")).toBeNull();

    // Verify "Catatan Petugas Kalibrasi" is not rendered
    expect(screen.queryByText("Catatan Petugas Kalibrasi")).toBeNull();
  });

  it("menyesuaikan kolom sampel air secara dinamis sesuai data yang diterima dari API", () => {
    const baseParameter = calibrationDetail.parameters[0];
    useCalibrationVerify.mockReturnValueOnce({
      data: {
        ...calibrationDetail,
        parameters: [
          { ...baseParameter, id: 1, parameterName: "COD", status: "PASS" },
          { ...baseParameter, id: 2, parameterName: "BOD", status: "PASS" },
          { ...baseParameter, id: 3, parameterName: "Amonia", status: "PASS" },
        ],
        waterSamples: [
          {
            id: "sample-custom",
            sampleName: "Sampel Inlet Sungai",
            cod: 45.2,
            bod: 12.8,
            nh3: 0.75,
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<VerificationPage />);

    const sampleCard = container.querySelector(".sample-card") as HTMLElement;
    expect(sampleCard).toBeInTheDocument();

    expect(within(sampleCard).getByText("Sampel: Sampel Inlet Sungai")).toBeInTheDocument();
    expect(within(sampleCard).getByText("COD")).toBeInTheDocument();
    expect(within(sampleCard).getByText("BOD")).toBeInTheDocument();
    expect(within(sampleCard).getByText("Amonia")).toBeInTheDocument();
    expect(within(sampleCard).getByText("45,20")).toBeInTheDocument();
    expect(within(sampleCard).getByText("12,80")).toBeInTheDocument();
    expect(within(sampleCard).getByText("0,75")).toBeInTheDocument();
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
