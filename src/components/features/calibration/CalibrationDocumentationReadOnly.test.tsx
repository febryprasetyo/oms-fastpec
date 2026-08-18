import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CalibrationDocumentationReadOnly } from "./CalibrationDocumentationReadOnly";

describe("CalibrationDocumentationReadOnly", () => {
  it("groups signed previews by parameter and explains an absent After photo", () => {
    render(<CalibrationDocumentationReadOnly parameters={[{
      id: 11, parameterId: "1", parameterName: "DO", spec: "", crmReferenceValue: null,
      crmReadingValue: null, remark: null, results: [], coefficients: [], status: null,
      documentation: {
        before: {
          id: "doc-before", calibrationDetailId: 11, parameterId: "1", photoType: "before",
          previewUrl: "https://api.test/media/before?signed=1", mimeType: "image/webp", size: 100,
          uploadedAt: "2026-08-18T00:00:00.000Z",
        },
      },
    }]} />);

    expect(screen.getByRole("heading", { name: "Dokumentasi Kalibrasi DO" })).toBeInTheDocument();
    expect(screen.getByAltText("Before Calibration DO")).toHaveAttribute("src", "https://api.test/media/before?signed=1");
    expect(screen.getByText("After Calibration: tidak didokumentasikan")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("https://api.test/media/before?signed=1")).not.toBeInTheDocument();
  });
});
