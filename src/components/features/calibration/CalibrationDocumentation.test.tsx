import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalibrationDocumentation } from "./CalibrationDocumentation";

vi.mock("@/hook/useCalibration", () => ({
  useUploadCalibrationDocumentation: () => ({ mutateAsync: vi.fn() }),
  useDeleteCalibrationDocumentation: () => ({ mutateAsync: vi.fn() }),
}));

describe("CalibrationDocumentation", () => {
  it("renders exactly one required Before slot and one optional After slot", () => {
    render(<CalibrationDocumentation
      calibrationId="cal-1"
      parameterId="7"
      detailId={54}
      documentation={{}}
      readOnly={false}
      ensurePersistedDetail={vi.fn().mockResolvedValue(54)}
    />);

    expect(screen.getByText("Calibration Documentation")).toBeInTheDocument();
    expect(screen.getByText("Before Calibration")).toBeInTheDocument();
    expect(screen.getByText("After Calibration")).toBeInTheDocument();
    expect(screen.getAllByText("Wajib")).toHaveLength(1);
  });
});
