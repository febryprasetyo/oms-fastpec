import React from "react";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/features/badge/StatusBadge";
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
  it("menampilkan label formulir dan status dalam bahasa Indonesia", () => {
    render(<LocalizedCalibrationFields />);

    expect(
      screen.getByText("Hasil Kalibrasi (Standar)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Koefisien Internal (K/B)")).toBeInTheDocument();
    expect(
      screen.getByText("Pengukuran Sampel Air dan Uji Blangko"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tambah Sampel")).toBeInTheDocument();
    expect(screen.getByText("Draf")).toBeInTheDocument();
  });
});
