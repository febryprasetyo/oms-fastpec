import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateCalibrationPage from "./page";

const { useCalibrationAuth, useCreateCalibration, useParameters, useStations } = vi.hoisted(() => ({
  useCalibrationAuth: vi.fn(),
  useCreateCalibration: vi.fn(),
  useParameters: vi.fn(),
  useStations: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/hook/useCalibration", () => ({
  useCalibrationAuth,
  useCreateCalibration,
  useParameters,
  useStations,
}));

describe("CreateCalibrationPage", () => {
  const originalTimezone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "Asia/Jakarta";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-11T17:00:00.000Z"));
    useCalibrationAuth.mockReturnValue({ officerName: "Budi Santoso" });
    useCreateCalibration.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useParameters.mockReturnValue({ data: [], isLoading: false });
    useStations.mockReturnValue({ data: [], isLoading: false });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
    vi.clearAllMocks();
  });

  it("mengisi tanggal hari ini dari kalender lokal, bukan tanggal UTC", () => {
    render(<CreateCalibrationPage />);

    const dateInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="date"]'));

    expect(dateInputs).toHaveLength(2);
    expect(dateInputs.map((input) => input.value)).toEqual(["2026-08-12", "2026-08-12"]);
  });
});
