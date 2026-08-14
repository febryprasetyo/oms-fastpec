import { z, type ZodError, type ZodIssue } from "zod";

const optionalNumber = z.preprocess((value) => value === "" || value == null ? undefined : value, z.coerce.number().finite().optional());
const nullableNumber = z.preprocess(
  (value) => value === "" || value == null ? null : value,
  z.coerce.number().finite().nullable(),
);

export const WaterSampleSchema = z.object({
  id: z.string().optional(), sampleName: z.string().nullish().transform((value) => value?.trim() || "Sampel Air"),
  temperature: optionalNumber, ph: optionalNumber, doValue: optionalNumber, tds: optionalNumber,
  turbidity: optionalNumber, cod: optionalNumber, bod: optionalNumber, tss: optionalNumber,
  nh3: optionalNumber, no3: optionalNumber, no2: optionalNumber, orp: optionalNumber, depth: optionalNumber,
});

export const ParameterCalibrationSchema = z.object({
  id: z.number().int().positive(), parameterId: z.string(), parameterName: z.string().nullish().transform((value) => value?.trim() || "Parameter"),
  parameterUnit: z.string().nullish().transform((value) => value || undefined), spec: z.string().nullish().transform((value) => value || ""), coeffType: z.enum(["K/B", "K1-K6"]).nullish().transform((value) => value || undefined),
  crmReferenceValue: optionalNumber.nullable(), crmReadingValue: optionalNumber.nullable(),
  remark: z.string().nullable().optional(),
  results: z.array(z.object({
    id: z.number().int().positive(), standardName: z.string().nullish().transform((value) => value?.trim() || "Standar"), standardValue: nullableNumber,
    minAcceptable: nullableNumber, maxAcceptable: nullableNumber, value: z.string().nullish().transform((value) => value ?? ""),
  })),
  coefficients: z.array(z.object({ key: z.string().nullish().transform((value) => value || "K"), value: optionalNumber })),
  status: z.enum(["PASS", "FAILED"]).nullable(),
});

export const CalibrationSchema = z.object({
  stationId: z.string().min(1, "Stasiun wajib dipilih."), stationName: z.string().nullish().transform((value) => value || ""), address: z.string().nullish().transform((value) => value || ""), latitude: z.coerce.number(), longitude: z.coerce.number(),
  calibrationStartDate: z.date(), calibrationEndDate: z.date(), officer: z.string().nullish().transform((value) => value || ""),
  parameters: z.array(ParameterCalibrationSchema).min(1, "Minimal satu parameter harus dipilih."), waterSamples: z.array(WaterSampleSchema), notes: z.string().nullish().transform((value) => value || ""),
}).refine((value) => value.calibrationEndDate >= value.calibrationStartDate, {
  message: "Tanggal selesai harus sama atau setelah tanggal mulai.", path: ["calibrationEndDate"],
});

const calibrationFieldLabel = (issue: ZodIssue): string => {
  const path = issue.path.map(String);
  if (path.includes("coefficients")) return "Nilai Koefisien";
  if (path.includes("results")) return "Hasil Kalibrasi Standar";
  if (path.includes("waterSamples")) {
    if (path.includes("sampleName")) return "Jenis Sampel";
    return "Nilai Sampel Air";
  }

  const labels: Record<string, string> = {
    address: "Alamat",
    calibrationEndDate: "Tanggal Selesai",
    calibrationStartDate: "Tanggal Mulai",
    latitude: "Lintang",
    longitude: "Bujur",
    notes: "Catatan",
    officer: "Petugas",
    parameters: "Parameter",
    stationId: "Stasiun",
    stationName: "Nama Stasiun",
  };
  return labels[path[0]] ?? "Formulir Kalibrasi";
};

const calibrationIssueMessage = (issue: ZodIssue, label: string): string => {
  const field = String(issue.path[0] ?? "");
  if (field === "stationId") return "Stasiun wajib dipilih.";
  if (field === "calibrationStartDate") return "Tanggal mulai kalibrasi tidak valid.";
  if (field === "calibrationEndDate" && issue.code !== "custom") return "Tanggal selesai kalibrasi tidak valid.";
  if (field === "parameters" && issue.code === "too_small") return "Minimal satu parameter harus dipilih.";
  if (issue.code === "custom") return issue.message;
  if (issue.code === "invalid_type" || issue.code === "not_finite") return `${label} harus berupa nilai yang valid.`;
  return `${label} belum valid.`;
};

export const formatCalibrationValidationError = (error: ZodError<CalibrationFormValues>): string => {
  const issue = error.issues[0];
  if (!issue) return "Formulir kalibrasi belum valid.";
  const label = calibrationFieldLabel(issue);
  return `${label}: ${calibrationIssueMessage(issue, label)}`;
};

export type CalibrationFormValues = z.infer<typeof CalibrationSchema>;
export type WaterSampleFormValues = z.infer<typeof WaterSampleSchema>;
