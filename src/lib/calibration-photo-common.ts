export const CALIBRATION_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
export const CALIBRATION_PHOTO_MAX_BYTES = 250_000;
export const CALIBRATION_PHOTO_TARGET_BYTES = 150_000;
export const CALIBRATION_PHOTO_MAX_DIMENSION = 1600;

const SUPPORTED_TYPES = new Set(CALIBRATION_PHOTO_ACCEPT.split(","));

export interface CompressionAttempt {
  maxDimension: number;
  quality: number;
}

export const getCompressionAttempts = (): CompressionAttempt[] => [
  { maxDimension: 1600, quality: 0.75 },
  { maxDimension: 1600, quality: 0.68 },
  { maxDimension: 1600, quality: 0.6 },
  { maxDimension: 1440, quality: 0.6 },
  { maxDimension: 1280, quality: 0.6 },
  { maxDimension: 1120, quality: 0.6 },
];

export const validateCalibrationPhotoFile = (file: File): void => {
  if (!SUPPORTED_TYPES.has(file.type)) {
    throw new Error("Pilih foto berformat JPEG, PNG, atau WebP.");
  }
};

export const selectCompressedPhoto = (results: Blob[]): Blob => {
  const target = results.find((result) => result.size <= CALIBRATION_PHOTO_TARGET_BYTES);
  if (target) return target;

  const smallest = results.reduce<Blob | undefined>(
    (selected, result) => !selected || result.size < selected.size ? result : selected,
    undefined,
  );
  if (smallest && smallest.size <= CALIBRATION_PHOTO_MAX_BYTES) return smallest;

  throw new Error("Foto masih lebih besar dari 250 KB setelah dikompresi. Pilih foto lain yang lebih kecil.");
};
