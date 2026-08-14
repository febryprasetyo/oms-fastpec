export const formatCalibrationMeasurement = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "-";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : String(value);
};

export const formatCalibrationInput = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : String(value);
};
