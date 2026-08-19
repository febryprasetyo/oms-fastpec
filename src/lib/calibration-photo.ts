export * from "./calibration-photo-common";
import { validateCalibrationPhotoFile } from "./calibration-photo-common";

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
