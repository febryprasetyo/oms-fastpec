import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("menampilkan laporan dengan tanggal, standar, dan istilah Indonesia", () => {
    render(<ReportPreview detail={calibrationDetail} />);

    expect(screen.getByText("LAPORAN KALIBRASI")).toBeInTheDocument();
    expect(screen.getByText(/10–12 Agustus 2026/)).toBeInTheDocument();
    expect(
      screen.getByText(/Morowali Utara, 12 Agustus 2026/),
    ).toBeInTheDocument();
    expect(screen.getByText("0,00 mg/L")).toBeInTheDocument();
    expect(
      screen.queryByText(/Calibration|Report|Station|Standart|Notes|Print|Download/i),
    ).not.toBeInTheDocument();
  });
});
