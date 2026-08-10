export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Parameter {
  id: string;
  name: string; // e.g. "pH", "DO", "Turbidity"
  spec: string; // e.g. "99-101 %" or "Accuracy ± 0.05"
}

export interface CalibrationStandard {
  id: string;
  name: string; // e.g. "CRM 0 %", "Buffer pH 4.00"
  standardValue?: number | null;
  minAcceptable?: number | null;
  maxAcceptable?: number | null;
}

export interface ParameterCalibrationDetail {
  id?: number;
  parameterId: string;
  parameterName: string;
  spec: string;
  coeffType?: 'linear' | 'polynomial';
  remark?: string | null;
  results: {
    id?: number;
    standardName: string;
    standardValue?: number | null;
    minAcceptable?: number | null;
    maxAcceptable?: number | null;
    value: string;
  }[];
  coefficients: {
    key: string;
    value: number;
  }[];
  status: 'PASS' | 'FAILED' | null;
}

export interface WaterSample {
  id: string;
  sampleName: string;
  temperature?: number;
  ph?: number;
  doValue?: number;
  conductivity?: number;
  tds?: number;
  salinity?: number;
  turbidity?: number;
  cod?: number;
  bod?: number;
  tss?: number;
  nh3?: number;
  no3?: number;
  orp?: number;
}

export type CalibrationStatus = 'Draft' | 'Submitted' | 'Approved';

export interface Calibration {
  id: string;
  reportNo: string;
  stationId: string;
  stationName: string;
  address: string;
  latitude: number;
  longitude: number;
  calibrationDate: string;
  contactPerson: string;
  phone: string;
  officer: string;
  status: CalibrationStatus;
  createdAt: string;
  updatedAt: string;
  verificationUrl?: string;
  uuid?: string;
}

export interface CalibrationDetail extends Calibration {
  parameters: ParameterCalibrationDetail[];
  waterSamples: WaterSample[];
  notes: string;
}

export type CalibrationApiStatus = "draft" | "submitted" | "approved";

export interface CalibrationApiStandard {
  id?: number;
  crm_name: string;
  crm_standard_value: number | null;
  min_acceptable: number | null;
  max_acceptable: number | null;
  calibration_result: number | null;
}

export interface CalibrationApiDetail {
  id: number;
  parameter_id: number;
  parameter_name?: string;
  coeff_type: "linear" | "polynomial" | null;
  coefficients: Record<string, number> | string | null;
  calculation_result: "PASS" | "FAILED" | null;
  remark: string | null;
  standards: CalibrationApiStandard[];
}

export interface CalibrationApiWaterSample {
  id?: number;
  sample_name: string;
  suhu: number | null;
  do: number | null;
  tur: number | null;
  tds: number | null;
  ph: number | null;
  orp: number | null;
  tss: number | null;
  bod: number | null;
  cod: number | null;
  amonia: number | null;
  nitrat: number | null;
  nitrit: number | null;
  kedalaman: number | null;
}
