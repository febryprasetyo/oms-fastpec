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

const CALIBRATION_NUMBER_FORMAT = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

type CalibrationDateParts = {
  day: number;
  month: number;
  year: number;
};

const parseCalibrationDate = (
  value: string | Date,
): CalibrationDateParts | null => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return {
      day: value.getDate(),
      month: value.getMonth() + 1,
      year: value.getFullYear(),
    };
  }

  const calendarDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (calendarDate) {
    const year = Number(calendarDate[1]);
    const month = Number(calendarDate[2]);
    const day = Number(calendarDate[3]);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() + 1 !== month ||
      parsed.getDate() !== day
    )
      return null;
    return { day, month, year };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    day: parsed.getDate(),
    month: parsed.getMonth() + 1,
    year: parsed.getFullYear(),
  };
};

const formatDateParts = (parts: CalibrationDateParts): string =>
  `${parts.day} ${CALIBRATION_MONTHS[parts.month - 1]} ${parts.year}`;

const formatCalibrationNumber = (value: string | number): string => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? CALIBRATION_NUMBER_FORMAT.format(numericValue)
    : String(value);
};

export const formatCalibrationDate = (value: string | Date): string => {
  const parts = parseCalibrationDate(value);
  return parts ? formatDateParts(parts) : String(value);
};

export const formatCalibrationDateRange = (
  start: string | Date,
  end: string | Date,
): string => {
  const startParts = parseCalibrationDate(start);
  const endParts = parseCalibrationDate(end);
  if (!startParts || !endParts)
    return `${formatCalibrationDate(start)}–${formatCalibrationDate(end)}`;
  if (
    startParts.year === endParts.year &&
    startParts.month === endParts.month
  ) {
    if (startParts.day === endParts.day) return formatDateParts(startParts);
    return `${startParts.day}–${endParts.day} ${CALIBRATION_MONTHS[startParts.month - 1]} ${startParts.year}`;
  }
  if (startParts.year === endParts.year) {
    return `${startParts.day} ${CALIBRATION_MONTHS[startParts.month - 1]}–${endParts.day} ${CALIBRATION_MONTHS[endParts.month - 1]} ${startParts.year}`;
  }
  return `${formatDateParts(startParts)}–${formatDateParts(endParts)}`;
};

export const formatCalibrationMeasurement = (
  value: string | number | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "-";
  return formatCalibrationNumber(value);
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
  const displayValue =
    value === null ? fallbackName : formatCalibrationMeasurement(value);
  const displayUnit = unit && unit.toLowerCase() !== "ph" ? ` ${unit}` : "";
  return `${isCrm ? "CRM " : ""}${displayValue}${displayUnit}`.trim();
};

export const formatCalibrationPlace = (value: string): string =>
  value.trim().replace(/^(?:Kabupaten|Kota)\s+/i, "");

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
  if (status === null || status === undefined || status.trim() === "")
    return "-";
  return CALIBRATION_STATUS_LABELS[status.trim().toUpperCase()] ?? status;
};
