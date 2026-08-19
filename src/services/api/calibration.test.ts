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

describe("calibration documentation service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uploads a WebP file to the exact parameter documentation slot", async () => {
    const file = new File(["webp"], "before.webp", { type: "image/webp" });
    const onUploadProgress = vi.fn();
    const post = vi.spyOn(axiosInstance, "post").mockResolvedValue({
      data: { data: {
        id: "doc-uploaded", calibration_detail_id: 54, parameter_id: 7, photo_type: "before",
        preview_url: "https://api.example.test/media/doc-uploaded?signature=ready", mime_type: "image/webp",
        file_size: 4, uploaded_at: "2026-08-18T10:00:00.000Z",
      } },
    });

    const result = await calibrationService.uploadDocumentation({
      calibrationId: "cal-1", detailId: 54, photoType: "before", file,
      accessToken: "access-token", onUploadProgress,
    });

    const [path, body, config] = post.mock.calls[0];
    expect(path).toBe("/api/calibrations/cal-1/details/54/documentation/before");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toMatchObject({
      name: "before.webp",
      type: "image/webp",
      size: 4,
    });
    expect(config).toEqual({
      headers: { Authorization: "Bearer access-token", "Content-Type": undefined },
      onUploadProgress,
    });
    expect(config?.headers).toHaveProperty("Content-Type", undefined);
    expect(result.previewUrl).toBe("https://api.example.test/media/doc-uploaded?signature=ready");
  });

  it("deletes only the requested parameter documentation slot", async () => {
    const remove = vi.spyOn(axiosInstance, "delete").mockResolvedValue({ data: undefined });

    await calibrationService.deleteDocumentation({
      calibrationId: "cal-1", detailId: 54, photoType: "after", accessToken: "access-token",
    });

    expect(remove).toHaveBeenCalledWith("/api/calibrations/cal-1/details/54/documentation/after", {
      headers: { Authorization: "Bearer access-token" },
    });
  });
});

describe("mapCalibrationDetail", () => {
  it("maps signed documentation metadata without rebuilding the preview URL", () => {
    const detail = mapCalibrationDetail({
      id: "calibration-docs",
      report_no: "KAL/2026/DOC",
      station_id: 1,
      calibration_start_date: "2026-08-18",
      calibration_end_date: "2026-08-18",
      status: "draft",
      created_at: "2026-08-18T00:00:00.000Z",
      updated_at: "2026-08-18T00:00:00.000Z",
      details: [{
        id: 54,
        parameter_id: 7,
        parameter_name: "pH",
        coeff_type: null,
        coefficients: null,
        crm_reference_value: null,
        crm_reading_value: null,
        calculation_result: null,
        remark: null,
        standards: [],
        documentation: [{
          id: "doc-1",
          calibration_detail_id: 54,
          parameter_id: 7,
          photo_type: "before",
          preview_url: "https://api.example.test/media/calibration/doc-1?signature=signed",
          mime_type: "image/webp",
          file_size: 128000,
          width: 1200,
          height: 900,
          checksum: "sha256:abc",
          uploaded_at: "2026-08-18T10:00:00.000Z",
        }],
      }],
      waterSamples: [],
    });

    expect(detail.parameters[0].documentation).toEqual({
      before: {
        id: "doc-1",
        calibrationDetailId: 54,
        parameterId: "7",
        photoType: "before",
        previewUrl: "https://api.example.test/media/calibration/doc-1?signature=signed",
        mimeType: "image/webp",
        size: 128000,
        width: 1200,
        height: 900,
        checksum: "sha256:abc",
        uploadedAt: "2026-08-18T10:00:00.000Z",
      },
    });
  });

  it("maps a parameter without documentation to empty documentation slots", () => {
    const detail = mapCalibrationDetail({
      id: "calibration-without-docs",
      report_no: "KAL/2026/EMPTY",
      station_id: 1,
      calibration_start_date: "2026-08-18",
      calibration_end_date: "2026-08-18",
      status: "draft",
      created_at: "2026-08-18T00:00:00.000Z",
      updated_at: "2026-08-18T00:00:00.000Z",
      details: [{
        id: 55,
        parameter_id: 8,
        parameter_name: "DO",
        coeff_type: null,
        coefficients: null,
        crm_reference_value: null,
        crm_reading_value: null,
        calculation_result: null,
        remark: null,
        standards: [],
      }],
      waterSamples: [],
    });

    expect(detail.parameters[0].documentation).toEqual({});
  });

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

  it("menormalkan nama API yang null atau dihilangkan ke bahasa Indonesia", () => {
    const detail = mapCalibrationDetail({
      id: "calibration-2",
      report_no: "KAL/2026/002",
      station_id: 1,
      calibration_start_date: "2026-08-10",
      calibration_end_date: "2026-08-12",
      officer_name: "Budi Santoso",
      status: "draft",
      created_at: "2026-08-10T00:00:00.000Z",
      updated_at: "2026-08-10T00:00:00.000Z",
      details: [{
        id: 9,
        parameter_id: 1000,
        parameter_name: null,
        coeff_type: null,
        coefficients: null,
        crm_reference_value: null,
        crm_reading_value: null,
        calculation_result: null,
        remark: null,
        standards: [{
          id: 10,
          crm_name: null,
          crm_standard_value: 0,
          min_acceptable: null,
          max_acceptable: null,
          calibration_result: null,
        }],
      }, {
        id: 11,
        parameter_id: 1001,
        coeff_type: null,
        coefficients: null,
        crm_reference_value: null,
        crm_reading_value: null,
        calculation_result: null,
        remark: null,
        standards: [{
          id: 12,
          crm_standard_value: 0,
          min_acceptable: null,
          max_acceptable: null,
          calibration_result: null,
        }],
      }],
      waterSamples: [{
        sample_name: null,
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
      }, {
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
    } as unknown as Parameters<typeof mapCalibrationDetail>[0]);

    expect(detail.parameters).toEqual(expect.arrayContaining([
      expect.objectContaining({ parameterName: "Parameter 1000" }),
      expect.objectContaining({ parameterName: "Parameter 1001" }),
    ]));
    expect(detail.parameters.flatMap((parameter) => parameter.results)).toEqual(expect.arrayContaining([
      expect.objectContaining({ standardName: "Standar", standardValue: 0 }),
    ]));
    expect(detail.waterSamples.map((sample) => sample.sampleName)).toEqual(["Sampel Air", "Sampel Air"]);
  });
});
