import { afterEach, describe, expect, it, vi } from "vitest";
import { axiosInstance } from "@/lib/axiosInstance";
import { calibrationService, mapCalibrationDetail } from "./calibration";

describe("calibrationService.downloadPdf", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests the authenticated PDF download endpoint and returns its blob", async () => {
    const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    const get = vi.spyOn(axiosInstance, "get").mockResolvedValue({ data: pdf });

    await expect(calibrationService.downloadPdf("calibration-42", "access-token")).resolves.toBe(pdf);

    expect(get).toHaveBeenCalledWith("/api/calibrations/calibration-42/print", {
      headers: { Authorization: "Bearer access-token" },
      responseType: "blob",
    });
  });
});

describe("mapCalibrationDetail", () => {
  it("menormalkan label API yang hilang atau kosong ke bahasa Indonesia", () => {
    const detail = mapCalibrationDetail({
      id: "calibration-1",
      report_no: "KAL/2026/001",
      station_id: 1,
      calibration_start_date: "2026-08-10",
      calibration_end_date: "2026-08-12",
      officer_name: "Budi Santoso",
      status: "draft",
      created_at: "2026-08-10T00:00:00.000Z",
      updated_at: "2026-08-10T00:00:00.000Z",
      details: [{
        id: 7,
        parameter_id: 999,
        parameter_name: "  ",
        coeff_type: null,
        coefficients: null,
        crm_reference_value: null,
        crm_reading_value: null,
        calculation_result: null,
        remark: null,
        standards: [{
          id: 8,
          crm_name: "  ",
          crm_standard_value: 0,
          min_acceptable: null,
          max_acceptable: null,
          calibration_result: null,
        }],
      }],
      waterSamples: [{
        sample_name: "  ",
        suhu: null,
        do: null,
        tur: null,
        tds: null,
        ph: null,
        orp: null,
        tss: null,
        bod: null,
        cod: null,
        amonia: null,
        nitrat: null,
        nitrit: null,
        kedalaman: null,
      }],
    });

    expect(detail.parameters[0]).toMatchObject({ parameterName: "Parameter 999" });
    expect(detail.parameters[0].results[0]).toMatchObject({ standardName: "Standar", standardValue: 0 });
    expect(detail.waterSamples[0]).toMatchObject({ sampleName: "Sampel Air" });
  });
});
