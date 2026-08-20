import { describe, expect, it } from "vitest";
import { toUpdateCalibrationPayload } from "@/lib/calibration-payload";
import { CalibrationSchema, formatCalibrationValidationError } from "./calibration.schema";
import { UpdateCalibrationPayloadSchema } from "./calibration-api.schema";

describe("CalibrationSchema", () => {
  it("menyerialisasi parameter baru tanpa id basis data", () => {
    const formValues = CalibrationSchema.parse({
      stationId: "1", stationName: "Stasiun Uji", address: "Jakarta", latitude: 0, longitude: 0,
      calibrationStartDate: new Date("2026-08-10T00:00:00"), calibrationEndDate: new Date("2026-08-12T00:00:00"), officer: "Budi",
      parameters: [{
        id: 0, parameterId: "2", parameterName: "TDS", spec: "", coeffType: "K/B",
        crmReferenceValue: null, crmReadingValue: null, remark: null,
        results: [{ id: 0, standardName: "100", standardValue: 100, minAcceptable: null, maxAcceptable: null, value: "99,8" }],
        coefficients: [{ key: "k", value: 1 }, { key: "b", value: 0 }], status: null,
      }], waterSamples: [], notes: "",
    });

    const payload = UpdateCalibrationPayloadSchema.parse(toUpdateCalibrationPayload(formValues));
    expect(payload.details?.[0]).toMatchObject({ parameter_id: 2 });
    expect(payload.details?.[0]).not.toHaveProperty("id");
    expect(payload.details?.[0].standards[0]).not.toHaveProperty("id");
  });

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

  it("memverifikasi dan memproses angka desimal dengan koma atau titik sebagai standar", () => {
    const formValues = CalibrationSchema.parse({
      stationId: "1",
      stationName: "Stasiun Uji",
      address: "Jakarta",
      latitude: "-6,2088",
      longitude: "106,8456",
      calibrationStartDate: new Date("2026-08-10T00:00:00"),
      calibrationEndDate: new Date("2026-08-12T00:00:00"),
      officer: "Budi Santoso",
      parameters: [{
        id: 1,
        parameterId: "2",
        parameterName: "TDS",
        spec: "",
        coeffType: "K/B",
        crmReferenceValue: "5,51",
        crmReadingValue: "5.48",
        remark: null,
        results: [
          { id: 1, standardName: "Solution 1", standardValue: "1,413", minAcceptable: null, maxAcceptable: null, value: "1,40" },
          { id: 2, standardName: "Solution 2", standardValue: 12.89, minAcceptable: null, maxAcceptable: null, value: "12.85" },
        ],
        coefficients: [
          { key: "k", value: "1,05" },
          { key: "b", value: "0,02" },
        ],
        status: null,
      }],
      waterSamples: [{
        sampleName: "Sampel 1",
        temperature: "27,5",
        ph: "7,02",
        doValue: "6.85",
        turbidity: "12,4",
        tds: "150,5",
      }],
      notes: "Pengujian kalibrasi dengan desimal koma dan titik",
    });

    expect(formValues.latitude).toBeCloseTo(-6.2088);
    expect(formValues.longitude).toBeCloseTo(106.8456);
    expect(formValues.parameters[0].crmReferenceValue).toBe(5.51);
    expect(formValues.parameters[0].crmReadingValue).toBe(5.48);
    expect(formValues.parameters[0].results[0].standardValue).toBe(1.413);
    expect(formValues.parameters[0].coefficients[0].value).toBe(1.05);
    expect(formValues.parameters[0].coefficients[1].value).toBe(0.02);
    expect(formValues.waterSamples[0].temperature).toBe(27.5);
    expect(formValues.waterSamples[0].ph).toBe(7.02);
    expect(formValues.waterSamples[0].doValue).toBe(6.85);

    const payload = toUpdateCalibrationPayload(formValues);
    expect(payload.details?.[0].crm_reference_value).toBe(5.51);
    expect(payload.details?.[0].crm_reading_value).toBe(5.48);
    expect(payload.details?.[0].standards[0].calibration_result).toBe(1.4);
    expect(payload.details?.[0].standards[1].calibration_result).toBe(12.85);
    expect(payload.details?.[0].coefficients).toEqual({ k: 1.05, b: 0.02 });
    expect(payload.waterSamples?.[0].suhu).toBe(27.5);
    expect(payload.waterSamples?.[0].ph).toBe(7.02);
    expect(payload.waterSamples?.[0].do).toBe(6.85);
    expect(payload.waterSamples?.[0].tur).toBe(12.4);
    expect(payload.waterSamples?.[0].tds).toBe(150.5);
  });
});
