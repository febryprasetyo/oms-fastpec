import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CalibrationFormValues } from "@/schemas/calibration.schema";
import { ParameterTable } from "./ParameterTable";

vi.mock("./CalibrationDocumentation", () => ({
  CalibrationDocumentation: ({ parameterId, detailId, readOnly }: { parameterId: string; detailId: number; readOnly: boolean }) =>
    <div data-testid={`documentation-${parameterId}`} data-detail-id={detailId} data-read-only={String(readOnly)} />,
}));

const values = {
  parameters: [{
    id: 11, parameterId: "1", parameterName: "DO", parameterUnit: "mg/L", spec: "",
    coeffType: "K/B" as const, crmReferenceValue: null, crmReadingValue: null, remark: null,
    results: [{ id: 21, standardName: "0", standardValue: 0, minAcceptable: null, maxAcceptable: null, value: "0" }],
    coefficients: [{ key: "k", value: 1 }, { key: "b", value: 0 }], status: "PASS" as const,
  }],
} as CalibrationFormValues;

const Harness = () => {
  const form = useForm<CalibrationFormValues>({ defaultValues: values });
  return <ParameterTable
    form={form}
    calibrationId="cal-1"
    status="Draft"
    ensurePersistedDetail={vi.fn().mockResolvedValue(11)}
  />;
};

describe("ParameterTable", () => {
  afterEach(cleanup);
  it("membatasi lebar card dan input kalibrasi di dalam area responsif", () => {
    render(<Harness />);

    const region = screen.getByRole("region", { name: "Input parameter kalibrasi" });
    const measurement = screen.getByPlaceholderText("Nilai terukur");

    expect(region).toHaveClass("min-w-0", "overflow-x-auto");
    expect(measurement).not.toHaveAttribute("size");
    expect(measurement).toHaveClass("min-w-0", "w-full");
  });

  it("attaches documentation and a focus anchor to each parameter card", () => {
    render(<Harness />);

    expect(screen.getByTestId("documentation-1")).toHaveAttribute("data-detail-id", "11");
    expect(document.querySelector('[data-calibration-parameter-id="1"]')).toHaveAttribute("tabindex", "-1");
  });
});
