import { z } from "zod";

const numericValue = z.coerce.number().finite();

export const CreateCalibrationDraftPayloadSchema = z.object({
  station_id: z.coerce.number().int().positive(),
  calibration_date: z.string().date(),
  contact_person: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  parameter_ids: z.array(z.coerce.number().int().positive()).min(1),
});

export const CalibrationStandardPayloadSchema = z.object({
  id: z.number().int().positive().optional(),
  crm_name: z.string().trim().min(1),
  crm_standard_value: numericValue.nullable(),
  min_acceptable: numericValue.nullable(),
  max_acceptable: numericValue.nullable(),
  calibration_result: numericValue.nullable(),
});

export const CalibrationDetailPayloadSchema = z.object({
  id: z.number().int().positive(),
  parameter_id: z.number().int().positive(),
  coeff_type: z.enum(["linear", "polynomial"]),
  coefficients: z.record(numericValue),
  remark: z.string().nullable().optional(),
  standards: z.array(CalibrationStandardPayloadSchema),
});

export const WaterSamplePayloadSchema = z.object({
  id: z.number().int().positive().optional(),
  sample_name: z.string().trim().min(1),
  suhu: numericValue.nullable(),
  do: numericValue.nullable(),
  tur: numericValue.nullable(),
  tds: numericValue.nullable(),
  ph: numericValue.nullable(),
  orp: numericValue.nullable(),
  tss: numericValue.nullable(),
  bod: numericValue.nullable(),
  cod: numericValue.nullable(),
  amonia: numericValue.nullable(),
  nitrat: numericValue.nullable(),
  nitrit: numericValue.nullable(),
  kedalaman: numericValue.nullable(),
});

export const UpdateCalibrationPayloadSchema = z.object({
  contact_person: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  notes: z.string().nullable(),
  parameter_ids: z.array(z.coerce.number().int().positive()).min(1),
  details: z.array(CalibrationDetailPayloadSchema),
  waterSamples: z.array(WaterSamplePayloadSchema),
});

export type CreateCalibrationDraftPayload = z.infer<typeof CreateCalibrationDraftPayloadSchema>;
export type UpdateCalibrationPayload = z.infer<typeof UpdateCalibrationPayloadSchema>;
