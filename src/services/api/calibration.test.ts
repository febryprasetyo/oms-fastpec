import { afterEach, describe, expect, it, vi } from "vitest";
import { axiosInstance } from "@/lib/axiosInstance";
import { calibrationService } from "./calibration";

describe("calibrationService.downloadPdf", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests the authenticated PDF download endpoint and returns its blob", async () => {
    const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    const get = vi.spyOn(axiosInstance, "get").mockResolvedValue({ data: pdf });

    await expect(calibrationService.downloadPdf("calibration-42", "access-token")).resolves.toBe(pdf);

    expect(get).toHaveBeenCalledWith("/api/calibrations/calibration-42/print", {
      headers: { Authorization: "Bearer access-token" },
      responseType: "blob",
    });
  });
});
