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
}

export interface ParameterCalibrationDetail {
  parameterId: string;
  parameterName: string;
  spec: string;
  results: {
    standardName: string;
    value: string;
  }[];
  coefficients: {
    key: string;
    value: number;
  }[];
  status: 'PASS' | 'FAILED';
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
