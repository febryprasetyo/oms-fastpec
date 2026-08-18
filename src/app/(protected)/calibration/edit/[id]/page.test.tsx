import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CalibrationDetail } from "@/types/calibration";
import EditCalibrationPage from "./page";

const {
  useCalibrationDetail,
  useParameters,
  useSubmitCalibration,
  useUpdateCalibration,
  routerPush,
  updateMutateAsync,
  submitMutateAsync,
  resolvedDetailId,
} = vi.hoisted(() => ({
  useCalibrationDetail: vi.fn(),
  useParameters: vi.fn(),
  useSubmitCalibration: vi.fn(),
  useUpdateCalibration: vi.fn(),
  routerPush: vi.fn(),
  updateMutateAsync: vi.fn(),
  submitMutateAsync: vi.fn(),
  resolvedDetailId: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "calibration-1" }),
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/hook/useCalibration", () => ({
  useCalibrationDetail,
  useParameters,
  useSubmitCalibration,
  useUpdateCalibration,
}));

vi.mock("@/components/features/calibration/WaterSampleTable", () => ({ WaterSampleTable: () => null }));
vi.mock("@/components/features/calibration/NotesEditor", () => ({ NotesEditor: () => null }));
vi.mock("@/components/features/badge/CalibrationHeader", () => ({ CalibrationHeader: () => null }));
vi.mock("@/components/features/calibration/CalibrationDocumentation", () => ({
  CalibrationDocumentation: ({ parameterId, ensurePersistedDetail }: { parameterId: string; ensurePersistedDetail: (id: string) => Promise<number> }) =>
    <button type="button" onClick={async () => resolvedDetailId(await ensurePersistedDetail(parameterId))}>Upload {parameterId}</button>,
}));

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
  parameters: [{
    id: 11, parameterId: "1", parameterName: "DO", parameterUnit: "mg/L", spec: "",
    coeffType: "K/B", crmReferenceValue: null, crmReadingValue: null, remark: null,
    results: [{ id: 21, standardName: "0", standardValue: 0, minAcceptable: null, maxAcceptable: null, value: "0" }],
    coefficients: [{ key: "k", value: 1 }, { key: "b", value: 0 }], status: "PASS", documentation: {},
  }],
  waterSamples: [],
  notes: "",
};

describe("EditCalibrationPage", () => {
  const originalTimezone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "Asia/Jakarta";
    updateMutateAsync.mockReset().mockResolvedValue(undefined);
    submitMutateAsync.mockReset().mockResolvedValue(undefined);
    resolvedDetailId.mockReset();
    useCalibrationDetail.mockReturnValue({ data: calibrationDetail, isLoading: false, refetch: vi.fn() });
    useParameters.mockReturnValue({ data: [
      { id: "1", name: "DO", spec: "", standards: [{ crmName: "0", standardValue: 0 }] },
      { id: "2", name: "TDS", spec: "", standards: [{ crmName: "100", standardValue: 100 }] },
    ] });
    useSubmitCalibration.mockReturnValue({ isPending: false, mutateAsync: submitMutateAsync });
    useUpdateCalibration.mockReturnValue({ mutateAsync: updateMutateAsync });
  });

  afterEach(() => {
    cleanup();
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("menyerialisasi nilai input tanggal dari kalender lokal tanpa bergeser ke UTC", async () => {
    render(<EditCalibrationPage />);

    await waitFor(() => {
      const dateInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="date"]'));
      expect(dateInputs.map((input) => input.value)).toEqual(["2026-08-12", "2026-08-14"]);
    });
  });

  it("memungkinkan laporan diajukan disimpan kembali tanpa mengajukan ulang", async () => {
    useCalibrationDetail.mockReturnValue({
      data: { ...calibrationDetail, status: "Submitted" },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<EditCalibrationPage />);

    await waitFor(() => {
      expect(document.querySelector<HTMLInputElement>('input[type="date"]')).toBeEnabled();
    });
    expect(screen.getByRole("button", { name: "Simpan Perubahan" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ajukan Kalibrasi" })).not.toBeInTheDocument();
    expect(screen.queryByText(/tidak dapat diedit/)).not.toBeInTheDocument();
  });

  it("mengunci laporan yang sudah disetujui", async () => {
    useCalibrationDetail.mockReturnValue({
      data: { ...calibrationDetail, status: "Approved" },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<EditCalibrationPage />);

    await waitFor(() => {
      expect(document.querySelector<HTMLInputElement>('input[type="date"]')).toBeDisabled();
    });
    expect(screen.getByText("Laporan berstatus Disetujui dan tidak dapat diedit.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Simpan/ })).not.toBeInTheDocument();
  });

  it("tidak menyimpan perubahan secara otomatis", async () => {
    render(<EditCalibrationPage />);
    await waitFor(() => expect(document.querySelector<HTMLInputElement>('input[type="date"]')).toHaveValue("2026-08-12"));
    vi.useFakeTimers();

    fireEvent.change(document.querySelectorAll<HTMLInputElement>('input[type="date"]')[0], { target: { value: "2026-08-13" } });
    vi.advanceTimersByTime(3000);

    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan formulir dan pilihan parameter hanya melalui tombol Simpan", async () => {
    render(<EditCalibrationPage />);
    await waitFor(() => expect(screen.getByRole("button", { name: "TDS" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "TDS" }));
    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(screen.getByText("TDS Kalibrasi")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simpan Draf" }));

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      id: "calibration-1",
      data: expect.objectContaining({
        parameter_ids: [1, 2],
        details: expect.arrayContaining([expect.objectContaining({ parameter_id: 2 })]),
      }),
    })));
  });

  it("menyimpan parameter baru otomatis sebelum upload untuk memperoleh detail ID", async () => {
    const persistedTds = {
      ...calibrationDetail.parameters[0], id: 22, parameterId: "2", parameterName: "TDS", documentation: {},
    };
    const refetch = vi.fn().mockResolvedValue({
      data: { ...calibrationDetail, parameters: [...calibrationDetail.parameters, persistedTds] },
    });
    useCalibrationDetail.mockReturnValue({ data: calibrationDetail, isLoading: false, refetch });
    render(<EditCalibrationPage />);
    await waitFor(() => expect(screen.getByRole("button", { name: "TDS" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "TDS" }));
    fireEvent.click(screen.getByRole("button", { name: "Upload 2" }));

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledOnce());
    await waitFor(() => expect(resolvedDetailId).toHaveBeenCalledWith(22));
    expect(refetch).toHaveBeenCalled();
  });

  it("mempertahankan pilihan parameter lokal ketika data laporan diperbarui di latar belakang", async () => {
    const { rerender } = render(<EditCalibrationPage />);
    await waitFor(() => expect(screen.getByRole("button", { name: "TDS" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "TDS" }));
    expect(screen.getByText("TDS Kalibrasi")).toBeInTheDocument();

    useCalibrationDetail.mockReturnValue({ data: { ...calibrationDetail, updatedAt: "2026-08-12T01:00:00.000Z" }, isLoading: false, refetch: vi.fn() });
    rerender(<EditCalibrationPage />);

    expect(screen.getByText("TDS Kalibrasi")).toBeInTheDocument();
  });

  it("tidak menimpa perubahan baru ketika penyimpanan sebelumnya masih berjalan", async () => {
    let resolveSave!: () => void;
    updateMutateAsync.mockReturnValue(new Promise<void>((resolve) => { resolveSave = resolve; }));
    render(<EditCalibrationPage />);
    await waitFor(() => expect(document.querySelectorAll<HTMLInputElement>('input[type="date"]')[0]).toHaveValue("2026-08-12"));

    fireEvent.change(document.querySelectorAll<HTMLInputElement>('input[type="date"]')[0], { target: { value: "2026-08-13" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Draf" }));
    fireEvent.change(document.querySelectorAll<HTMLInputElement>('input[type="date"]')[0], { target: { value: "2026-08-14" } });
    await act(async () => resolveSave());

    expect(document.querySelectorAll<HTMLInputElement>('input[type="date"]')[0]).toHaveValue("2026-08-14");
    expect(screen.queryByText("Tersimpan")).not.toBeInTheDocument();
  });

  it("tidak mengajukan snapshot lama ketika formulir berubah selama penyimpanan", async () => {
    let resolveSave!: () => void;
    updateMutateAsync.mockReturnValue(new Promise<void>((resolve) => { resolveSave = resolve; }));
    render(<EditCalibrationPage />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Ajukan Kalibrasi" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Ajukan Kalibrasi" }));
    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(1));
    fireEvent.change(document.querySelectorAll<HTMLInputElement>('input[type="date"]')[0], { target: { value: "2026-08-13" } });
    await act(async () => resolveSave());

    expect(submitMutateAsync).not.toHaveBeenCalled();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("membatalkan perubahan tanpa menyimpan dan kembali ke detail", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<EditCalibrationPage />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Batalkan" })).toBeInTheDocument());
    fireEvent.change(document.querySelectorAll<HTMLInputElement>('input[type="date"]')[0], { target: { value: "2026-08-13" } });

    fireEvent.click(screen.getByRole("button", { name: "Batalkan" }));

    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(routerPush).toHaveBeenCalledWith("/calibration/calibration-1");
  });
});
