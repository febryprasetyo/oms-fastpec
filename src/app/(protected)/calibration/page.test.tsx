import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Calibration } from "@/types/calibration";
import CalibrationDashboard from "./page";

const {
  useApproveCalibration,
  useCalibrationAuth,
  useCalibrations,
  useDeleteCalibration,
} = vi.hoisted(() => ({
  useApproveCalibration: vi.fn(),
  useCalibrationAuth: vi.fn(),
  useCalibrations: vi.fn(),
  useDeleteCalibration: vi.fn(),
}));

vi.mock("@/hook/useCalibration", () => ({
  useApproveCalibration,
  useCalibrationAuth,
  useCalibrations,
  useDeleteCalibration,
}));

const makeCalibration = (id: string, status: Calibration["status"]): Calibration => ({
  id,
  reportNo: `KAL/2026/00${id}`,
  stationId: `station-${id}`,
  stationName: `Stasiun ${id}`,
  address: "Kabupaten Morowali Utara",
  stationCity: "Kabupaten Morowali Utara",
  latitude: -2.1234,
  longitude: 121.5678,
  calibrationStartDate: "2026-08-10",
  calibrationEndDate: "2026-08-12",
  calibrationDate: "2026-08-10 – 2026-08-12",
  contactPerson: "",
  phone: "",
  officer: "Budi Santoso",
  status,
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
});

describe("CalibrationDashboard", () => {
  beforeEach(() => {
    useCalibrationAuth.mockReturnValue({ role: "adm" });
    useCalibrations.mockReturnValue({
      data: {
        items: [makeCalibration("1", "Draft"), makeCalibration("2", "Submitted"), makeCalibration("3", "Approved")],
        total: 3,
      },
      isLoading: false,
    });
    useDeleteCalibration.mockReturnValue({ mutateAsync: vi.fn() });
    useApproveCalibration.mockReturnValue({ mutateAsync: vi.fn() });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("menerjemahkan status mentah, memformat rentang tanggal, dan mempertahankan tindakan workflow", () => {
    render(<CalibrationDashboard />);

    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByText("Diajukan")).toBeInTheDocument();
    expect(screen.getByText("Disetujui")).toBeInTheDocument();
    expect(screen.getAllByText("10–12 Agustus 2026")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Edit kalibrasi" })).toHaveAttribute("href", "/calibration/edit/1");
    expect(screen.getByRole("button", { name: "Hapus kalibrasi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Setujui kalibrasi" })).toBeInTheDocument();
    expect(screen.queryByText(/^(Draft|Submitted|Approved)$/)).not.toBeInTheDocument();
  });
});
