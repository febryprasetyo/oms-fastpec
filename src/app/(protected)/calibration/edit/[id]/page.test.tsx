import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CalibrationDetail } from "@/types/calibration";
import EditCalibrationPage from "./page";

const {
  useCalibrationDetail,
  useParameters,
  useSubmitCalibration,
  useUpdateCalibration,
} = vi.hoisted(() => ({
  useCalibrationDetail: vi.fn(),
  useParameters: vi.fn(),
  useSubmitCalibration: vi.fn(),
  useUpdateCalibration: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "calibration-1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hook/useCalibration", () => ({
  useCalibrationDetail,
  useParameters,
  useSubmitCalibration,
  useUpdateCalibration,
}));

vi.mock("@/components/features/calibration/ParameterTable", () => ({ ParameterTable: () => null }));
vi.mock("@/components/features/calibration/WaterSampleTable", () => ({ WaterSampleTable: () => null }));
vi.mock("@/components/features/calibration/NotesEditor", () => ({ NotesEditor: () => null }));
vi.mock("@/components/features/badge/CalibrationHeader", () => ({ CalibrationHeader: () => null }));

const calibrationDetail: CalibrationDetail = {
  id: "calibration-1",
  reportNo: "KAL/2026/001",
  stationId: "station-1",
  stationName: "Stasiun Pemantauan Bahoea Reko-Reko",
  address: "Kabupaten Morowali Utara",
  stationCity: "Kabupaten Morowali Utara",
  latitude: -2.1234,
  longitude: 121.5678,
  calibrationStartDate: "2026-08-12",
  calibrationEndDate: "2026-08-14",
  calibrationDate: "2026-08-12 – 2026-08-14",
  contactPerson: "",
  phone: "",
  officer: "Budi Santoso",
  status: "Draft",
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
  parameters: [],
  waterSamples: [],
  notes: "",
};

describe("EditCalibrationPage", () => {
  const originalTimezone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "Asia/Jakarta";
    useCalibrationDetail.mockReturnValue({ data: calibrationDetail, isLoading: false, refetch: vi.fn() });
    useParameters.mockReturnValue({ data: [] });
    useSubmitCalibration.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useUpdateCalibration.mockReturnValue({ mutateAsync: vi.fn() });
  });

  afterEach(() => {
    cleanup();
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
    vi.clearAllMocks();
  });

  it("menyerialisasi nilai input tanggal dari kalender lokal tanpa bergeser ke UTC", async () => {
    render(<EditCalibrationPage />);

    await waitFor(() => {
      const dateInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="date"]'));
      expect(dateInputs.map((input) => input.value)).toEqual(["2026-08-12", "2026-08-14"]);
    });
  });
});
