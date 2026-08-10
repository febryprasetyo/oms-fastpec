export type CoefficientType = "linear" | "polynomial";

export interface CalibrationStandardConfig {
  crmName: string;
  standardValue: number;
  minAcceptable: number;
  maxAcceptable: number;
}

export interface CalibrationParameterConfig {
  id: string;
  name: string;
  unit: string;
  coefficientType: CoefficientType;
  coefficientKeys: string[];
  standards: CalibrationStandardConfig[];
}

const linear = (id: string, name: string, unit: string, standards: CalibrationStandardConfig[]): CalibrationParameterConfig => ({
  id,
  name,
  unit,
  coefficientType: "linear",
  coefficientKeys: ["k", "b"],
  standards,
});

export const calibrationParameterConfigs: CalibrationParameterConfig[] = [
  linear("1", "Temperature", "°C", [{ crmName: "CRM Temp 25°C", standardValue: 25, minAcceptable: 24.8, maxAcceptable: 25.2 }]),
  { id: "2", name: "pH", unit: "pH", coefficientType: "polynomial", coefficientKeys: ["k1", "k2", "k3", "k4", "k5", "k6"], standards: [{ crmName: "CRM pH 4.01", standardValue: 4.01, minAcceptable: 3.96, maxAcceptable: 4.06 }, { crmName: "CRM pH 7.00", standardValue: 7, minAcceptable: 6.95, maxAcceptable: 7.05 }, { crmName: "CRM pH 10.01", standardValue: 10.01, minAcceptable: 9.96, maxAcceptable: 10.06 }] },
  linear("3", "DO", "mg/L", [{ crmName: "DO Zero", standardValue: 0, minAcceptable: 0, maxAcceptable: 0.1 }, { crmName: "DO Span (Air Sat.)", standardValue: 100, minAcceptable: 99, maxAcceptable: 101 }]),
  linear("4", "Conductivity", "µS/cm", [{ crmName: "CRM 1413 µS/cm", standardValue: 1413, minAcceptable: 1398, maxAcceptable: 1428 }]),
  linear("5", "Turbidity", "NTU", [{ crmName: "CRM 0 NTU", standardValue: 0, minAcceptable: 0, maxAcceptable: 1 }, { crmName: "CRM 100 NTU", standardValue: 100, minAcceptable: 95, maxAcceptable: 105 }]),
  linear("6", "COD", "mg/L", [{ crmName: "CRM COD 100 mg/L", standardValue: 100, minAcceptable: 98, maxAcceptable: 102 }]),
  linear("7", "BOD", "mg/L", [{ crmName: "CRM BOD 50 mg/L", standardValue: 50, minAcceptable: 49, maxAcceptable: 51 }]),
  linear("8", "TSS", "mg/L", [{ crmName: "CRM TSS 100 mg/L", standardValue: 100, minAcceptable: 98, maxAcceptable: 102 }]),
  linear("9", "NH3", "mg/L", [{ crmName: "CRM NH3 1.0 mg/L", standardValue: 1, minAcceptable: 0.95, maxAcceptable: 1.05 }]),
  linear("10", "NO3", "mg/L", [{ crmName: "CRM NO3 10.0 mg/L", standardValue: 10, minAcceptable: 9.8, maxAcceptable: 10.2 }]),
  linear("11", "ORP", "mV", [{ crmName: "CRM ORP 220 mV", standardValue: 220, minAcceptable: 215, maxAcceptable: 225 }]),
];

export const getCalibrationParameterConfig = (parameterId: string | number) =>
  calibrationParameterConfigs.find((parameter) => parameter.id === String(parameterId));
