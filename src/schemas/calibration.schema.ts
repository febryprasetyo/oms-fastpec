import { z } from 'zod';

export const WaterSampleSchema = z.object({
  id: z.string().optional(),
  sampleName: z.string().min(1, 'Sample name is required'),
  temperature: z.coerce.number().optional(),
  ph: z.coerce.number().optional(),
  doValue: z.coerce.number().optional(),
  conductivity: z.coerce.number().optional(),
  tds: z.coerce.number().optional(),
  salinity: z.coerce.number().optional(),
  turbidity: z.coerce.number().optional(),
  cod: z.coerce.number().optional(),
  bod: z.coerce.number().optional(),
  tss: z.coerce.number().optional(),
  nh3: z.coerce.number().optional(),
  no3: z.coerce.number().optional(),
  orp: z.coerce.number().optional(),
});

export const CoefficientSchema = z.object({
  key: z.string(),
  value: z.coerce.number(),
});

export const ResultSchema = z.object({
  id: z.number().int().positive().optional(),
  standardName: z.string(),
  standardValue: z.coerce.number().nullable().optional(),
  minAcceptable: z.coerce.number().nullable().optional(),
  maxAcceptable: z.coerce.number().nullable().optional(),
  value: z.string().min(1, 'Value is required'),
});

export const ParameterCalibrationSchema = z.object({
  id: z.number().int().positive().optional(),
  parameterId: z.string(),
  parameterName: z.string(),
  spec: z.string(),
  coeffType: z.enum(['linear', 'polynomial']).optional(),
  remark: z.string().nullable().optional(),
  results: z.array(ResultSchema),
  coefficients: z.array(CoefficientSchema),
  status: z.enum(['PASS', 'FAILED']).nullable().default('PASS'),
});

export const CalibrationSchema = z.object({
  stationId: z.string().min(1, 'Station is required'),
  stationName: z.string(),
  address: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  calibrationDate: z.date({
    required_error: 'Calibration date is required',
  }),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(1, 'Phone is required'),
  officer: z.string().min(1, 'Officer is required'),
  parameters: z.array(ParameterCalibrationSchema).min(1, 'Select at least one parameter'),
  waterSamples: z.array(WaterSampleSchema),
  notes: z.string().optional(),
});

export type CalibrationFormValues = z.infer<typeof CalibrationSchema>;
export type WaterSampleFormValues = z.infer<typeof WaterSampleSchema>;
export type ParameterCalibrationFormValues = z.infer<typeof ParameterCalibrationSchema>;
