import {
  CALIBRATION_PHOTO_TARGET_BYTES,
  getCompressionAttempts,
  selectCompressedPhoto,
  validateCalibrationPhotoFile,
} from "@/lib/calibration-photo";

interface WorkerCanvas {
  getContext(contextId: "2d"): { drawImage: (image: ImageBitmap, x: number, y: number, width: number, height: number) => void } | null;
  convertToBlob(options: { type: string; quality: number }): Promise<Blob>;
}

export interface CalibrationPhotoWorkerDependencies {
  createImageBitmap: (file: File, options: { imageOrientation: "from-image" }) => Promise<ImageBitmap>;
  createCanvas: (width: number, height: number) => WorkerCanvas;
}

export interface ProcessedCalibrationPhoto {
  blob: Blob;
  width: number;
  height: number;
}

const browserDependencies: CalibrationPhotoWorkerDependencies = {
  createImageBitmap: (file, options) => globalThis.createImageBitmap(file, options),
  createCanvas: (width, height) => new OffscreenCanvas(width, height) as unknown as WorkerCanvas,
};

const containedDimensions = (width: number, height: number, maxDimension: number) => {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

export const processCalibrationPhoto = async (
  file: File,
  dependencies: CalibrationPhotoWorkerDependencies = browserDependencies,
): Promise<ProcessedCalibrationPhoto> => {
  validateCalibrationPhotoFile(file);
  const bitmap = await dependencies.createImageBitmap(file, { imageOrientation: "from-image" });
  const results: ProcessedCalibrationPhoto[] = [];

  try {
    for (const attempt of getCompressionAttempts()) {
      const dimensions = containedDimensions(bitmap.width, bitmap.height, attempt.maxDimension);
      const canvas = dependencies.createCanvas(dimensions.width, dimensions.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Perangkat tidak dapat memproses foto ini.");
      context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height);
      const blob = await canvas.convertToBlob({ type: "image/webp", quality: attempt.quality });
      const result = { blob, ...dimensions };
      results.push(result);
      if (blob.size <= CALIBRATION_PHOTO_TARGET_BYTES) return result;
    }

    const selected = selectCompressedPhoto(results.map((result) => result.blob));
    return results.find((result) => result.blob === selected)!;
  } finally {
    bitmap.close();
  }
};

type WorkerRequest = { id: string; file: File };
type WorkerResponse = { id: string; result?: ProcessedCalibrationPhoto; error?: string };

const workerScope = globalThis as typeof globalThis & {
  document?: Document;
  postMessage?: (message: WorkerResponse) => void;
  onmessage?: (event: MessageEvent<WorkerRequest>) => void;
};

if (typeof workerScope.document === "undefined" && typeof workerScope.postMessage === "function") {
  workerScope.onmessage = async ({ data }) => {
    try {
      const result = await processCalibrationPhoto(data.file);
      workerScope.postMessage?.({ id: data.id, result });
    } catch (error) {
      workerScope.postMessage?.({
        id: data.id,
        error: error instanceof Error ? error.message : "Foto gagal dikompresi.",
      });
    }
  };
}
