export interface Station {
  id: string;
  name: string;
  address: string;
  stationCity?: string;
  latitude: number;
  longitude: number;
  coordinate?: string;
}

export interface Parameter {
  id: string;
  name: string;
  spec: string;
  unit?: string;
  standards?: { crmName: string; standardValue: number }[];
}

export type CalibrationCoefficientType = "K/B" | "K1-K6";

export type CalibrationPhotoType = "before" | "after";

export interface CalibrationDocumentation {
  id: string;
  calibrationDetailId: number;
  parameterId: string;
  photoType: CalibrationPhotoType;
  previewUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  checksum?: string;
  uploadedAt: string;
}

export type ParameterCalibrationDocumentation = Partial<Record<CalibrationPhotoType, CalibrationDocumentation>>;

export interface ParameterCalibrationDetail {
  id: number;
  parameterId: string;
  parameterName: string;
  parameterUnit?: string;
  spec: string;
  coeffType?: CalibrationCoefficientType;
  crmReferenceValue: number | null;
  crmReadingValue: number | null;
  remark: string | null;
  results: {
    id: number;
    standardName: string;
    standardValue: number | null;
    minAcceptable: number | null;
    maxAcceptable: number | null;
    value: string;
  }[];
  coefficients: { key: string; value?: number }[];
  status: "PASS" | "FAILED" | null;
  documentation: ParameterCalibrationDocumentation;
}

export interface WaterSample {
  id?: string;
  sampleName: string;
  temperature?: number;
  ph?: number;
  doValue?: number;
  tds?: number;
  turbidity?: number;
  cod?: number;
  bod?: number;
  tss?: number;
  nh3?: number;
  no3?: number;
  no2?: number;
  orp?: number;
  depth?: number;
}

export type CalibrationStatus = "Draft" | "Submitted" | "Approved";
export type CalibrationApiStatus = "draft" | "submitted" | "approved";

export interface Calibration {
  id: string;
  reportNo: string;
  stationId: string;
  stationName: string;
  address: string;
  stationCity?: string;
  latitude: number;
  longitude: number;
  calibrationStartDate: string;
  calibrationEndDate: string;
  /** Compatibility alias for older list/preview components. */
  calibrationDate: string;
  contactPerson: string;
  phone: string;
  officer: string;
  status: CalibrationStatus;
  createdAt: string;
  updatedAt: string;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  uuid?: string;
}

export interface CalibrationDetail extends Calibration {
  parameters: ParameterCalibrationDetail[];
  waterSamples: WaterSample[];
  notes: string;
}

export interface CalibrationApiStandard {
  id: number;
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
  parameter_unit?: string;
  coeff_type: CalibrationCoefficientType | null;
  coefficients: Record<string, number> | string | null;
  crm_reference_value: number | null;
  crm_reading_value: number | null;
  calculation_result: "PASS" | "FAILED" | null;
  remark: string | null;
  standards: CalibrationApiStandard[];
  documentation?: CalibrationApiDocumentation[];
}

export interface CalibrationApiDocumentation {
  id: string;
  calibration_detail_id: number;
  parameter_id: number;
  photo_type: CalibrationPhotoType;
  preview_url: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  checksum?: string;
  uploaded_at: string;
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
