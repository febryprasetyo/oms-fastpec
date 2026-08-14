import { format } from "date-fns";
import type { CalibrationFormValues } from "@/schemas/calibration.schema";
import type { CreateCalibrationDraftPayload, UpdateCalibrationPayload } from "@/schemas/calibration-api.schema";

const nullableNumber = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const toCreateCalibrationDraftPayload = (values: Pick<CalibrationFormValues, "stationId" | "calibrationStartDate" | "calibrationEndDate" | "parameters">): CreateCalibrationDraftPayload => ({
  station_id: Number(values.stationId),
  calibration_start_date: format(values.calibrationStartDate, "yyyy-MM-dd"),
  calibration_end_date: format(values.calibrationEndDate, "yyyy-MM-dd"),
  parameter_ids: values.parameters.map((parameter) => Number(parameter.parameterId)),
});

export const toUpdateCalibrationPayload = (values: CalibrationFormValues): UpdateCalibrationPayload => ({
  calibration_start_date: format(values.calibrationStartDate, "yyyy-MM-dd"),
  calibration_end_date: format(values.calibrationEndDate, "yyyy-MM-dd"),
  notes: values.notes?.trim() || null,
  parameter_ids: values.parameters.map((parameter) => Number(parameter.parameterId)),
  details: values.parameters.map((parameter) => ({
    id: parameter.id,
    ...(parameter.coeffType ? { coeff_type: parameter.coeffType } : {}),
    ...(parameter.coeffType && parameter.coefficients.some(({ value }) => value !== undefined && Number.isFinite(Number(value)))
      ? { coefficients: Object.fromEntries(parameter.coefficients.filter(({ value }) => value !== undefined && Number.isFinite(Number(value))).map(({ key, value }) => [key, Number(value)])) }
      : {}),
    crm_reference_value: nullableNumber(parameter.crmReferenceValue),
    crm_reading_value: nullableNumber(parameter.crmReadingValue),
    standards: parameter.results.map((result) => ({ id: result.id, crm_name: result.standardName, calibration_result: nullableNumber(result.value) })),
  })),
  waterSamples: values.waterSamples.map((sample) => ({
    ...(sample.id ? { id: Number(sample.id) } : {}), sample_name: sample.sampleName.trim(),
    suhu: nullableNumber(sample.temperature), do: nullableNumber(sample.doValue), tur: nullableNumber(sample.turbidity),
    tds: nullableNumber(sample.tds), ph: nullableNumber(sample.ph), orp: nullableNumber(sample.orp),
    tss: nullableNumber(sample.tss), bod: nullableNumber(sample.bod), cod: nullableNumber(sample.cod),
    amonia: nullableNumber(sample.nh3), nitrat: nullableNumber(sample.no3), nitrit: nullableNumber(sample.no2), kedalaman: nullableNumber(sample.depth),
  })),
});
