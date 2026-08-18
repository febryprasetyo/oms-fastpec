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

interface CalibrationPhotoWorkerResult {
  blob: Blob;
  width: number;
  height: number;
}

type WorkerFactory = () => Worker;

const defaultWorkerFactory: WorkerFactory = () => new Worker(
  new URL("../workers/calibration-photo.worker.ts", import.meta.url),
  { type: "module" },
);

export const compressCalibrationPhoto = async (
  file: File,
  workerFactory: WorkerFactory = defaultWorkerFactory,
): Promise<File> => {
  validateCalibrationPhotoFile(file);
  const worker = workerFactory();
  const id = crypto.randomUUID();

  return new Promise<File>((resolve, reject) => {
    const cleanup = () => worker.terminate();
    worker.onmessage = (event: MessageEvent<{ id: string; result?: CalibrationPhotoWorkerResult; error?: string }>) => {
      if (event.data.id !== id) return;
      cleanup();
      if (event.data.error || !event.data.result) {
        reject(new Error(event.data.error || "Foto gagal dikompresi."));
        return;
      }
      const baseName = file.name.replace(/\.[^.]+$/, "") || "calibration";
      resolve(new File([event.data.result.blob], `${baseName}.webp`, { type: "image/webp" }));
    };
    worker.onerror = () => {
      cleanup();
      reject(new Error("Foto gagal dikompresi pada perangkat ini."));
    };
    worker.postMessage({ id, file });
  });
};
