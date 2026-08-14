import { z } from "zod";

const optionalNumber = z.preprocess((value) => value === "" || value == null ? undefined : value, z.coerce.number().finite().optional());
const nullableNumber = z.preprocess(
  (value) => value === "" || value == null ? null : value,
  z.coerce.number().finite().nullable(),
);

export const WaterSampleSchema = z.object({
  id: z.string().optional(), sampleName: z.string().nullish().transform((value) => value?.trim() || "Water Sample"),
  temperature: optionalNumber, ph: optionalNumber, doValue: optionalNumber, tds: optionalNumber,
  turbidity: optionalNumber, cod: optionalNumber, bod: optionalNumber, tss: optionalNumber,
  nh3: optionalNumber, no3: optionalNumber, no2: optionalNumber, orp: optionalNumber, depth: optionalNumber,
});

export const ParameterCalibrationSchema = z.object({
  id: z.number().int().positive(), parameterId: z.string(), parameterName: z.string().nullish().transform((value) => value || "Parameter"),
  parameterUnit: z.string().nullish().transform((value) => value || undefined), spec: z.string().nullish().transform((value) => value || ""), coeffType: z.enum(["K/B", "K1-K6"]).nullish().transform((value) => value || undefined),
  crmReferenceValue: optionalNumber.nullable(), crmReadingValue: optionalNumber.nullable(),
  remark: z.string().nullable().optional(),
  results: z.array(z.object({
    id: z.number().int().positive(), standardName: z.string().nullish().transform((value) => value || "Standard"), standardValue: nullableNumber,
    minAcceptable: nullableNumber, maxAcceptable: nullableNumber, value: z.string().nullish().transform((value) => value ?? ""),
  })),
  coefficients: z.array(z.object({ key: z.string().nullish().transform((value) => value || "K"), value: optionalNumber })),
  status: z.enum(["PASS", "FAILED"]).nullable(),
});

export const CalibrationSchema = z.object({
  stationId: z.string().min(1), stationName: z.string().nullish().transform((value) => value || ""), address: z.string().nullish().transform((value) => value || ""), latitude: z.coerce.number(), longitude: z.coerce.number(),
  calibrationStartDate: z.date(), calibrationEndDate: z.date(), officer: z.string().nullish().transform((value) => value || ""),
  parameters: z.array(ParameterCalibrationSchema).min(1), waterSamples: z.array(WaterSampleSchema), notes: z.string().nullish().transform((value) => value || ""),
}).refine((value) => value.calibrationEndDate >= value.calibrationStartDate, {
  message: "Tanggal selesai harus sama atau setelah tanggal mulai", path: ["calibrationEndDate"],
});

export type CalibrationFormValues = z.infer<typeof CalibrationSchema>;
export type WaterSampleFormValues = z.infer<typeof WaterSampleSchema>;
