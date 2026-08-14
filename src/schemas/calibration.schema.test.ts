import { describe, expect, it } from "vitest";
import { toUpdateCalibrationPayload } from "@/lib/calibration-payload";
import { CalibrationSchema, formatCalibrationValidationError } from "./calibration.schema";

describe("CalibrationSchema", () => {
  it("menampilkan label dan pesan validasi profesional tanpa path internal atau bahasa Inggris", () => {
    const invalidStation = CalibrationSchema.safeParse({
      stationId: "",
      stationName: "",
      address: "",
      latitude: 0,
      longitude: 0,
      calibrationStartDate: new Date("2026-08-12T00:00:00"),
      calibrationEndDate: new Date("2026-08-12T00:00:00"),
      officer: "",
      parameters: [],
      waterSamples: [],
      notes: "",
    });

    expect(invalidStation.success).toBe(false);
    if (invalidStation.success) throw new Error("Fixture validasi seharusnya gagal.");
    const message = formatCalibrationValidationError(invalidStation.error);
    expect(message).toBe("Stasiun: Stasiun wajib dipilih.");
    expect(message).not.toMatch(/stationId|String must contain|Required/i);

    const invalidDate = CalibrationSchema.safeParse({
      stationId: "1",
      stationName: "Stasiun Uji",
      address: "Jakarta",
      latitude: 0,
      longitude: 0,
      calibrationStartDate: new Date("tanggal-tidak-valid"),
      calibrationEndDate: new Date("2026-08-12T00:00:00"),
      officer: "Budi Santoso",
      parameters: [{
        id: 1,
        parameterId: "1",
        parameterName: "DO",
        spec: "",
        coeffType: null,
        crmReferenceValue: null,
        crmReadingValue: null,
        remark: null,
        results: [],
        coefficients: [],
        status: null,
      }],
      waterSamples: [],
      notes: "",
    });

    expect(invalidDate.success).toBe(false);
    if (invalidDate.success) throw new Error("Fixture tanggal seharusnya gagal.");
    expect(formatCalibrationValidationError(invalidDate.error)).toBe("Tanggal Mulai: Tanggal mulai kalibrasi tidak valid.");
  });

  it("menyediakan fallback bahasa Indonesia untuk label formulir yang kosong", () => {
    const formValues = CalibrationSchema.parse({
      stationId: "1",
      stationName: "Stasiun Uji",
      address: "Jakarta",
      latitude: -6.2,
      longitude: 106.8,
      calibrationStartDate: new Date("2026-08-10T00:00:00"),
      calibrationEndDate: new Date("2026-08-12T00:00:00"),
      officer: "Budi Santoso",
      parameters: [{
        id: 7,
        parameterId: "999",
        parameterName: "  ",
        parameterUnit: "mg/L",
        spec: "",
        coeffType: null,
        crmReferenceValue: null,
        crmReadingValue: null,
        remark: null,
        results: [{
          id: 8,
          standardName: "  ",
          standardValue: 0,
          minAcceptable: null,
          maxAcceptable: null,
          value: "",
        }],
        coefficients: [],
        status: null,
      }],
      waterSamples: [{ sampleName: "  " }],
      notes: "",
    });

    expect(formValues.parameters[0].parameterName).toBe("Parameter");
    expect(formValues.parameters[0].results[0].standardName).toBe("Standar");
    expect(formValues.waterSamples[0].sampleName).toBe("Sampel Air");

    const payload = toUpdateCalibrationPayload(formValues);

    expect(payload.details?.[0].standards[0].crm_name).toBe("Standar");
    expect(payload.waterSamples?.[0].sample_name).toBe("Sampel Air");
  });

  it("menyediakan fallback bahasa Indonesia untuk label formulir null atau yang dihilangkan", () => {
    const formValues = CalibrationSchema.parse({
      stationId: "1",
      stationName: "Stasiun Uji",
      address: "Jakarta",
      latitude: -6.2,
      longitude: 106.8,
      calibrationStartDate: new Date("2026-08-10T00:00:00"),
      calibrationEndDate: new Date("2026-08-12T00:00:00"),
      officer: "Budi Santoso",
      parameters: [{
        id: 9,
        parameterId: "1000",
        parameterName: null,
        parameterUnit: "mg/L",
        spec: "",
        coeffType: null,
        crmReferenceValue: null,
        crmReadingValue: null,
        remark: null,
        results: [{
          id: 10,
          standardName: null,
          standardValue: 0,
          minAcceptable: null,
          maxAcceptable: null,
          value: "",
        }, {
          id: 11,
          standardValue: 0,
          minAcceptable: null,
          maxAcceptable: null,
          value: "",
        }],
        coefficients: [],
        status: null,
      }, {
        id: 12,
        parameterId: "1001",
        parameterUnit: "mg/L",
        spec: "",
        coeffType: null,
        crmReferenceValue: null,
        crmReadingValue: null,
        remark: null,
        results: [],
        coefficients: [],
        status: null,
      }],
      waterSamples: [{ sampleName: null }, {}],
      notes: "",
    });

    expect(formValues.parameters.map((parameter) => parameter.parameterName)).toEqual(["Parameter", "Parameter"]);
    expect(formValues.parameters[0].results.map((result) => result.standardName)).toEqual(["Standar", "Standar"]);
    expect(formValues.waterSamples.map((sample) => sample.sampleName)).toEqual(["Sampel Air", "Sampel Air"]);

    const payload = toUpdateCalibrationPayload(formValues);

    expect(payload.details?.[0].standards.map((standard) => standard.crm_name)).toEqual(["Standar", "Standar"]);
    expect(payload.waterSamples?.map((sample) => sample.sample_name)).toEqual(["Sampel Air", "Sampel Air"]);
  });
});
