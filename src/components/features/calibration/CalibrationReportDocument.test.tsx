import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CalibrationReportDocument } from "./CalibrationReportDocument";
import type { CalibrationDetail } from "@/types/calibration";

const mockDetail: CalibrationDetail = {
  id: "cal-100",
  reportNo: "KAL/2026/08/001",
  stationId: "st-1",
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
  qrCodeDataUrl: "data:image/png;base64,mockqrcode",
  verificationUrl: "https://oms.cahayamascemerlang.co.id/verify/uuid-123",
  notes: "<p>Kalibrasi sensor berhasil dilakukan dengan akurat.</p>",
  parameters: [
    {
      id: 1,
      parameterId: "param-ph",
      parameterName: "pH",
      parameterUnit: "",
      spec: "",
      crmReferenceValue: 7.0,
      crmReadingValue: 7.02,
      remark: null,
      results: [
        {
          id: 101,
          standardName: "Buffer 4.01",
          standardValue: 4.01,
          minAcceptable: null,
          maxAcceptable: null,
          value: "4.00",
        },
        {
          id: 102,
          standardName: "Buffer 7.00",
          standardValue: 7.0,
          minAcceptable: null,
          maxAcceptable: null,
          value: "7.01",
        },
      ],
      coefficients: [
        { key: "k1", value: -58.78 },
        { key: "k2", value: -58.78 },
      ],
      status: "PASS",
      documentation: {
        before: {
          id: "doc-1",
          calibrationDetailId: 1,
          parameterId: "param-ph",
          photoType: "before",
          previewUrl: "https://api.test/photos/ph_before.webp",
          mimeType: "image/webp",
          size: 12000,
          uploadedAt: "2026-08-10T00:00:00.000Z",
        },
        after: {
          id: "doc-2",
          calibrationDetailId: 1,
          parameterId: "param-ph",
          photoType: "after",
          previewUrl: "https://api.test/photos/ph_after.webp",
          mimeType: "image/webp",
          size: 13000,
          uploadedAt: "2026-08-10T00:00:00.000Z",
        },
      },
    },
    {
      id: 2,
      parameterId: "param-do",
      parameterName: "DO",
      parameterUnit: "mg/L",
      spec: "",
      crmReferenceValue: null,
      crmReadingValue: null,
      remark: null,
      results: [
        {
          id: 201,
          standardName: "Zero Oxygen",
          standardValue: 0.0,
          minAcceptable: null,
          maxAcceptable: null,
          value: "0.02",
        },
      ],
      coefficients: [
        { key: "k", value: 1.002 },
        { key: "b", value: -0.01 },
      ],
      status: "PASS",
      documentation: {},
    },
  ],
  waterSamples: [
    {
      sampleName: "Aquades Blank",
      ph: 7.01,
      doValue: 0.01,
      temperature: 25.0,
    },
    {
      sampleName: "Sampel Air Sungai",
      ph: 7.45,
      doValue: 6.82,
      temperature: 26.2,
    },
  ],
};

describe("CalibrationReportDocument", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders report header and station information correctly", () => {
    render(<CalibrationReportDocument detail={mockDetail} />);

    expect(screen.getAllByText("Nomor Laporan: KAL/2026/08/001")).toHaveLength(2);
    expect(screen.getByText(": Stasiun Bahoea Reko-Reko")).toBeInTheDocument();
    expect(screen.getByText(": 10–12 Agustus 2026")).toBeInTheDocument();
    expect(screen.getByText(": Kabupaten Morowali Utara")).toBeInTheDocument();
  });

  it("renders sensor parameters table with standards, readings, and coefficients", () => {
    render(<CalibrationReportDocument detail={mockDetail} />);

    expect(screen.getByText("1. Kalibrasi Parameter Sensor")).toBeInTheDocument();
    expect(screen.getByText("Kalibrasi pH")).toBeInTheDocument();
    expect(screen.getByText("Kalibrasi DO")).toBeInTheDocument();
    expect(screen.getAllByText("Memenuhi")).toHaveLength(2);
  });

  it("renders water sample measurement table", () => {
    render(<CalibrationReportDocument detail={mockDetail} />);

    expect(screen.getByText("2. Pengukuran Sampel Air dan Uji Blangko")).toBeInTheDocument();
    expect(screen.getByText("Aquades Blank")).toBeInTheDocument();
    expect(screen.getByText("Sampel Air Sungai")).toBeInTheDocument();
  });

  it("renders notes and signature block", () => {
    render(<CalibrationReportDocument detail={mockDetail} />);

    expect(screen.getByText("Kalibrasi sensor berhasil dilakukan dengan akurat.")).toBeInTheDocument();
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("Morowali Utara, 12 Agustus 2026")).toBeInTheDocument();
  });

  it("renders photo documentation attachment section", () => {
    render(<CalibrationReportDocument detail={mockDetail} />);

    expect(screen.getByRole("heading", { name: "LAMPIRAN DOKUMENTASI" })).toBeInTheDocument();
    expect(screen.getByText("Dokumentasi Parameter: pH")).toBeInTheDocument();
    expect(screen.getByText("Dokumentasi Parameter: DO")).toBeInTheDocument();
    expect(screen.getAllByText("Tidak ada foto sebelum kalibrasi")).toHaveLength(2);
  });

  it("renders page footers with total page numbers", () => {
    render(<CalibrationReportDocument detail={mockDetail} />);

    expect(screen.getByText("Halaman 1 dari 2")).toBeInTheDocument();
    expect(screen.getByText("Halaman 2 dari 2")).toBeInTheDocument();
  });
});
