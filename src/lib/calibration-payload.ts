import { format } from "date-fns";
import type { CalibrationFormValues } from "@/schemas/calibration.schema";
import type { CreateCalibrationDraftPayload, UpdateCalibrationPayload } from "@/schemas/calibration-api.schema";

const nullableNumber = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === "") return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const toCreateCalibrationDraftPayload = (values: CalibrationFormValues): CreateCalibrationDraftPayload => ({
  station_id: Number(values.stationId),
  calibration_date: format(values.calibrationDate, "yyyy-MM-dd"),
  contact_person: values.contactPerson.trim(),
  phone: values.phone.trim(),
  parameter_ids: values.parameters.map((parameter) => Number(parameter.parameterId)),
});

export const toUpdateCalibrationPayload = (values: CalibrationFormValues): UpdateCalibrationPayload => ({
  contact_person: values.contactPerson.trim(),
  phone: values.phone.trim(),
  notes: values.notes?.trim() || null,
  parameter_ids: values.parameters.map((parameter) => Number(parameter.parameterId)),
  details: values.parameters
    .filter((parameter) => parameter.id !== undefined)
    .map((parameter) => ({
      id: parameter.id as number,
      parameter_id: Number(parameter.parameterId),
      coeff_type: parameter.coeffType ?? (parameter.parameterName.toLowerCase() === "ph" ? "polynomial" : "linear"),
      coefficients: Object.fromEntries(
        parameter.coefficients.map((coefficient) => [coefficient.key.toLowerCase(), Number(coefficient.value)]),
      ),
      remark: parameter.remark ?? null,
      standards: parameter.results.map((result) => ({
        ...(result.id ? { id: result.id } : {}),
        crm_name: result.standardName,
        crm_standard_value: nullableNumber(result.standardValue),
        min_acceptable: nullableNumber(result.minAcceptable),
        max_acceptable: nullableNumber(result.maxAcceptable),
        calibration_result: nullableNumber(result.value),
      })),
    })),
  waterSamples: values.waterSamples.map((sample) => ({
    ...(sample.id ? { id: Number(sample.id) } : {}),
    sample_name: sample.sampleName.trim(),
    suhu: nullableNumber(sample.temperature),
    do: nullableNumber(sample.doValue),
    tur: nullableNumber(sample.turbidity),
    tds: nullableNumber(sample.tds),
    ph: nullableNumber(sample.ph),
    orp: nullableNumber(sample.orp),
    tss: nullableNumber(sample.tss),
    bod: nullableNumber(sample.bod),
    cod: nullableNumber(sample.cod),
    amonia: nullableNumber(sample.nh3),
    nitrat: nullableNumber(sample.no3),
    nitrit: null,
    kedalaman: null,
  })),
});
