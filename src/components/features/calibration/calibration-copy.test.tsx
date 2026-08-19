import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/features/badge/StatusBadge";
import { CalibrationHeader } from "@/components/features/badge/CalibrationHeader";
import { type CalibrationFormValues } from "@/schemas/calibration.schema";
import { ParameterTable } from "./ParameterTable";
import { WaterSampleTable } from "./WaterSampleTable";

const LocalizedCalibrationFields = () => {
  const form = useForm<CalibrationFormValues>({
    defaultValues: {
      parameters: [
        {
          id: 1,
          parameterId: "1",
          parameterName: "pH",
          parameterUnit: "",
          spec: "6,5–8,5",
          coeffType: "K/B",
          crmReferenceValue: null,
          crmReadingValue: null,
          remark: null,
          results: [],
          coefficients: [],
          status: null,
        },
        {
          id: 2,
          parameterId: "10",
          parameterName: "Amonia",
          parameterUnit: "mg/L",
          spec: "",
          coeffType: "K/B",
          crmReferenceValue: null,
          crmReadingValue: null,
          remark: null,
          results: [],
          coefficients: [],
          status: null,
        },
        {
          id: 3,
          parameterId: "11",
          parameterName: "Nitrat",
          parameterUnit: "mg/L",
          spec: "",
          coeffType: undefined,
          crmReferenceValue: null,
          crmReadingValue: null,
          remark: null,
          results: [],
          coefficients: [],
          status: null,
        },
        {
          id: 4,
          parameterId: "12",
          parameterName: "Nitrit",
          parameterUnit: "mg/L",
          spec: "",
          coeffType: undefined,
          crmReferenceValue: null,
          crmReadingValue: null,
          remark: null,
          results: [],
          coefficients: [],
          status: null,
        },
      ],
      waterSamples: [],
    },
  });

  return (
    <>
      <ParameterTable form={form} />
      <WaterSampleTable form={form} />
      <StatusBadge status="Draft" />
    </>
  );
};

describe("salinan komponen kalibrasi", () => {
  afterEach(cleanup);

  it("menampilkan label formulir dan status dalam bahasa Indonesia", () => {
    render(<LocalizedCalibrationFields />);

    expect(
      screen.getAllByText("Hasil Kalibrasi (Standar)")[0],
    ).toBeInTheDocument();
    expect(screen.getAllByText("Koefisien Internal (K/B)")[0]).toBeInTheDocument();
    expect(
      screen.getByText("Pengukuran Sampel Air dan Uji Blangko"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tambah Sampel")).toBeInTheDocument();
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByText("Amonia Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Nitrat Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Nitrit Kalibrasi")).toBeInTheDocument();
    expect(screen.getByText("Amonia (mg/L)")).toBeInTheDocument();
    expect(screen.getByText("Nitrat (mg/L)")).toBeInTheDocument();
    expect(screen.getByText("Nitrit (mg/L)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tambah Sampel" }));

    expect(screen.getByDisplayValue("Sampel Air (Sungai 1)")).toBeInTheDocument();
  });

  it("menampilkan rentang tanggal tepat dan status workflow mentah sebagai label Indonesia di header", () => {
    const { rerender } = render(
      <CalibrationHeader
        reportNo="KAL/2026/001"
        officer="Budi Santoso"
        calibrationStartDate="2026-08-10"
        calibrationEndDate="2026-08-12"
        status="Draft"
      />,
    );

    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByText("Tanggal: 10–12 Agustus 2026")).toBeInTheDocument();

    rerender(
      <CalibrationHeader
        reportNo="KAL/2026/001"
        officer="Budi Santoso"
        calibrationStartDate="2026-08-10"
        calibrationEndDate="2026-08-12"
        status="Submitted"
      />,
    );
    expect(screen.getByText("Diajukan")).toBeInTheDocument();

    rerender(
      <CalibrationHeader
        reportNo="KAL/2026/001"
        officer="Budi Santoso"
        calibrationStartDate="2026-08-10"
        calibrationEndDate="2026-08-12"
        status="Approved"
      />,
    );
    expect(screen.getByText("Disetujui")).toBeInTheDocument();
  });
});
