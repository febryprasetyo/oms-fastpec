import { z } from "zod";

const numericValue = z.coerce.number().finite();

export const CreateCalibrationDraftPayloadSchema = z.object({
  station_id: z.coerce.number().int().positive(),
  calibration_start_date: z.string().date(),
  calibration_end_date: z.string().date(),
  parameter_ids: z.array(z.coerce.number().int().positive()).min(1),
}).refine((value) => value.calibration_end_date >= value.calibration_start_date, {
  message: "Tanggal selesai harus sama atau setelah tanggal mulai.",
  path: ["calibration_end_date"],
});

export const CalibrationStandardPayloadSchema = z.object({
  id: z.number().int().positive().optional(),
  crm_name: z.string().trim().min(1),
  calibration_result: numericValue.nullable(),
});

export const CalibrationDetailPayloadSchema = z.object({
  id: z.number().int().positive().optional(),
  parameter_id: z.number().int().positive(),
  coeff_type: z.enum(["K/B", "K1-K6"]).optional(),
  coefficients: z.record(numericValue).optional(),
  crm_reference_value: numericValue.nullable(),
  crm_reading_value: numericValue.nullable(),
  standards: z.array(CalibrationStandardPayloadSchema),
});

export const WaterSamplePayloadSchema = z.object({
  id: z.number().int().positive().optional(),
  sample_name: z.string().trim().min(1),
  suhu: numericValue.nullable(), do: numericValue.nullable(), tur: numericValue.nullable(),
  tds: numericValue.nullable(), ph: numericValue.nullable(), orp: numericValue.nullable(),
  tss: numericValue.nullable(), bod: numericValue.nullable(), cod: numericValue.nullable(),
  amonia: numericValue.nullable(), nitrat: numericValue.nullable(), nitrit: numericValue.nullable(),
  kedalaman: numericValue.nullable(),
});

export const UpdateCalibrationPayloadSchema = z.object({
  calibration_start_date: z.string().date().optional(),
  calibration_end_date: z.string().date().optional(),
  notes: z.string().nullable().optional(),
  parameter_ids: z.array(z.coerce.number().int().positive()).min(1).optional(),
  details: z.array(CalibrationDetailPayloadSchema).optional(),
  waterSamples: z.array(WaterSamplePayloadSchema).optional(),
});

export type CreateCalibrationDraftPayload = z.infer<typeof CreateCalibrationDraftPayloadSchema>;
export type UpdateCalibrationPayload = z.infer<typeof UpdateCalibrationPayloadSchema>;
