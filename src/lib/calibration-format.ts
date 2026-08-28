import type { ZodError } from "zod";
import type { CalibrationFormValues } from "@/schemas/calibration.schema";

const CALIBRATION_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

type DateParts = {
  day: number;
  month: number;
  year: number;
};

const parseDateParts = (value: string | Date): DateParts | null => {
  if (typeof value === "string") {
    const raw = value.trim();
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(raw);
    if (isoDateMatch) {
      const year = Number(isoDateMatch[1]);
      const month = Number(isoDateMatch[2]);
      const day = Number(isoDateMatch[3]);
      const parsed = new Date(year, month - 1, day);
      if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() + 1 !== month ||
        parsed.getDate() !== day
      ) {
        return null;
      }
      return { day, month, year };
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

const formatDateFromParts = (parts: DateParts): string => {
  const monthName = CALIBRATION_MONTHS[parts.month - 1];
  return `${parts.day} ${monthName} ${parts.year}`;
};

const formatCalibrationNumber = (value: string | number): string => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

export const formatCalibrationDateInput = (value: Date): string => {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
};

export const formatCalibrationDate = (value: string | Date): string => {
  const parts = parseDateParts(value);
  return parts ? formatDateFromParts(parts) : String(value);
};

export const formatCalibrationDateRange = (
  startDate: string | Date,
  endDate: string | Date,
): string => {
  const start = parseDateParts(startDate);
  const end = parseDateParts(endDate);

  if (!start || !end) {
    return `${formatCalibrationDate(startDate)}–${formatCalibrationDate(endDate)}`;
  }

  if (start.year === end.year && start.month === end.month) {
    if (start.day === end.day) {
      return formatDateFromParts(start);
    }
    return `${start.day}–${end.day} ${CALIBRATION_MONTHS[start.month - 1]} ${start.year}`;
  }

  if (start.year === end.year) {
    return `${start.day} ${CALIBRATION_MONTHS[start.month - 1]}–${end.day} ${CALIBRATION_MONTHS[end.month - 1]} ${start.year}`;
  }

  return `${formatDateFromParts(start)}–${formatDateFromParts(end)}`;
};

export const formatCalibrationMeasurement = (
  value: string | number | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "-";
  return formatCalibrationNumber(value);
};

export const formatCalibrationCoefficient = (
  value: string | number | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
    useGrouping: false,
  }).format(parsed);
};

export const formatCalibrationInput = (
  value: string | number | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "";
  return formatCalibrationNumber(value);
};

export const formatCalibrationStandard = (
  name: string,
  value: number | null,
  unit?: string,
): string => {
  const trimmedName = name.trim();
  const isCrm = /^crm\b/i.test(trimmedName);
  const fallbackName = trimmedName.replace(/^crm\b\s*/i, "");
  const formattedValue =
    value === null ? fallbackName : formatCalibrationMeasurement(value);
  const formattedUnit = formattedValue === "-" || !unit ? "" : ` ${unit}`;
  return `${isCrm ? "CRM " : ""}${formattedValue}${formattedUnit}`.trim();
};

export const formatCalibrationPlace = (value: string): string =>
  value
    .trim()
    .replace(/^(kabupaten|kota)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");

const CALIBRATION_PARAMETER_LABELS: Record<string, string> = {
  AMONIA: "Amonia",
  "AMONIA (NH3-N)": "Amonia",
  NH3: "Amonia",
  "NH3-N": "Amonia",
  NITRAT: "Nitrat",
  "NITRAT (NO3-N)": "Nitrat",
  NO3: "Nitrat",
  "NO3-N": "Nitrat",
  NITRIT: "Nitrit",
  "NITRIT (NO2-N)": "Nitrit",
  NO2: "Nitrit",
  "NO2-N": "Nitrit",
};

export const formatCalibrationParameterName = (value: string): string => {
  const trimmedValue = value.trim();
  if (CALIBRATION_PARAMETER_LABELS[trimmedValue.toUpperCase()]) {
    return CALIBRATION_PARAMETER_LABELS[trimmedValue.toUpperCase()];
  }
  return trimmedValue.replace(/\s*\([A-Za-z0-9\-\+]+\)/g, "").trim() || trimmedValue;
};

const CALIBRATION_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Disetujui",
  DRAFT: "Draf",
  FAILED: "Tidak Lulus",
  PASS: "Lulus",
  PENDING: "Menunggu",
  REJECTED: "Ditolak",
  SUBMITTED: "Diajukan",
};

export const translateCalibrationStatus = (
  status: string | null | undefined,
): string => {
  if (!status) return "-";
  return CALIBRATION_STATUS_LABELS[status.toUpperCase()] ?? status;
};

export const evaluateStandardResult = (
  parameterName: string,
  readingValue: number | string | null | undefined,
  standardValue: number | null | undefined,
): "PASS" | "FAILED" | null => {
  if (
    readingValue === null ||
    readingValue === undefined ||
    readingValue === "" ||
    standardValue === null ||
    standardValue === undefined
  ) {
    return null;
  }
  const reading =
    typeof readingValue === "number" ? readingValue : Number(readingValue);
  const standard =
    typeof standardValue === "number" ? standardValue : Number(standardValue);
  if (!Number.isFinite(reading) || !Number.isFinite(standard)) return null;

  const normalized = parameterName.trim().toLowerCase();

  // pH accuracy +/- 0.05
  if (normalized === "ph") {
    return Math.abs(reading - standard) <= 0.05 + 1e-9 ? "PASS" : "FAILED";
  }

  // DO zero point accuracy +/- 0.05
  if (normalized === "do" && standard === 0) {
    return Math.abs(reading) <= 0.05 + 1e-9 ? "PASS" : "FAILED";
  }

  // Suhu / Temp +/- 0.5 C
  if (normalized.startsWith("suhu") || normalized.startsWith("temp")) {
    return Math.abs(reading - standard) <= 0.5 + 1e-9 ? "PASS" : "FAILED";
  }

  // Default: %Trueness = (reading / standard) * 100 in [90, 110]
  if (standard === 0) {
    return Math.abs(reading) <= 0.05 + 1e-9 ? "PASS" : "FAILED";
  }
  const trueness = (reading / standard) * 100;
  return trueness >= 89.999999 && trueness <= 110.000001 ? "PASS" : "FAILED";
};

export const deriveCalibrationDetailStatus = (
  parameterName: string,
  results: { standardValue: number | null; value: string | number | null }[],
  fallbackStatus?: "PASS" | "FAILED" | null,
): "PASS" | "FAILED" | null => {
  if (!results || results.length === 0) {
    return fallbackStatus ?? null;
  }

  let hasEvaluable = false;
  let hasMissing = false;

  for (const r of results) {
    if (
      r.value === null ||
      r.value === undefined ||
      r.value === "" ||
      r.standardValue === null ||
      r.standardValue === undefined
    ) {
      hasMissing = true;
      continue;
    }
    const evalStatus = evaluateStandardResult(
      parameterName,
      r.value,
      r.standardValue,
    );
    if (evalStatus === "FAILED") return "FAILED";
    if (evalStatus === "PASS") hasEvaluable = true;
  }

  if (hasEvaluable && !hasMissing) return "PASS";
  return fallbackStatus ?? null;
};
