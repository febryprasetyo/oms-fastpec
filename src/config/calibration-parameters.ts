import type { CalibrationCoefficientType } from "@/types/calibration";

export interface CalibrationParameterConfig {
  id: string;
  name: string;
  unit: string;
  coefficientType?: CalibrationCoefficientType;
}

// IDs and names follow the calibration master documented by the backend.
// CRM standards are deliberately not duplicated here: GET detail is authoritative.
export const calibrationParameterConfigs: CalibrationParameterConfig[] = [
  { id: "2", name: "DO", unit: "%", coefficientType: "K/B" },
  { id: "3", name: "Turbidity", unit: "NTU", coefficientType: "K/B" },
  { id: "4", name: "TDS", unit: "mg/L", coefficientType: "K/B" },
  { id: "5", name: "pH", unit: "pH", coefficientType: "K1-K6" },
  { id: "7", name: "TSS", unit: "mg/L", coefficientType: "K/B" },
  { id: "8", name: "BOD", unit: "mg/L", coefficientType: "K/B" },
  { id: "9", name: "COD", unit: "mg/L", coefficientType: "K/B" },
  { id: "10", name: "Amonia", unit: "mg/L", coefficientType: "K/B" },
  { id: "11", name: "Nitrat", unit: "mg/L" },
  { id: "12", name: "Nitrit", unit: "mg/L" },
];

export const getCalibrationParameterConfig = (parameterId: string | number) =>
  calibrationParameterConfigs.find((parameter) => parameter.id === String(parameterId));
