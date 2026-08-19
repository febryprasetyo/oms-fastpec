import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { calibrationService } from "@/services/api/calibration";
import type { CalibrationDetail, CalibrationDocumentation } from "@/types/calibration";
import {
  useCalibrationAuth,
  useDeleteCalibrationDocumentation,
  useUploadCalibrationDocumentation,
} from "./useCalibration";

const authState = vi.hoisted(() => ({ user: undefined as unknown }));

vi.mock("@/services/store", () => ({
  useAuthStore: (selector: (state: { user: unknown }) => unknown) => selector(authState),
}));

describe("useCalibrationAuth", () => {
  beforeEach(() => {
    authState.user = undefined;
  });

  it("menggunakan Petugas sebagai nama fallback yang terlihat pengguna", () => {
    const { result } = renderHook(() => useCalibrationAuth());

    expect(result.current.officerName).toBe("Petugas");
  });
});

const detail: CalibrationDetail = {
  id: "cal-1", reportNo: "KAL/1", stationId: "1", stationName: "Station", address: "Address",
  latitude: 0, longitude: 0, calibrationStartDate: "2026-08-18", calibrationEndDate: "2026-08-18",
  calibrationDate: "2026-08-18", contactPerson: "", phone: "", officer: "Officer", status: "Draft",
  createdAt: "2026-08-18T00:00:00.000Z", updatedAt: "2026-08-18T00:00:00.000Z",
  parameters: [{
    id: 54, parameterId: "7", parameterName: "pH", spec: "", crmReferenceValue: null,
    crmReadingValue: null, remark: null, results: [], coefficients: [], status: null,
    documentation: {
      after: {
        id: "doc-after", calibrationDetailId: 54, parameterId: "7", photoType: "after",
        previewUrl: "https://api.test/after", mimeType: "image/webp", size: 10,
        uploadedAt: "2026-08-18T00:00:00.000Z",
      },
    },
  }],
  waterSamples: [], notes: "",
};

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe("calibration documentation mutations", () => {
  beforeEach(() => {
    authState.user = { token: { access_token: "access-token" }, user_data: {} };
    vi.restoreAllMocks();
  });

  it("reconciles only the uploaded slot and preserves sibling documentation", async () => {
    const uploaded: CalibrationDocumentation = {
      id: "doc-before", calibrationDetailId: 54, parameterId: "7", photoType: "before",
      previewUrl: "https://api.test/before?signed", mimeType: "image/webp", size: 20,
      uploadedAt: "2026-08-18T01:00:00.000Z",
    };
    vi.spyOn(calibrationService, "uploadDocumentation").mockResolvedValue(uploaded);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["calibration", "cal-1"], detail);
    const { result } = renderHook(() => useUploadCalibrationDocumentation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        calibrationId: "cal-1", detailId: 54, parameterId: "7", photoType: "before",
        file: new File(["webp"], "before.webp", { type: "image/webp" }),
      });
    });

    const cached = queryClient.getQueryData<CalibrationDetail>(["calibration", "cal-1"]);
    expect(cached?.parameters[0].documentation.before).toEqual(uploaded);
    expect(cached?.parameters[0].documentation.after?.id).toBe("doc-after");
    await waitFor(() => expect(queryClient.getQueryState(["calibration", "cal-1"])?.isInvalidated).toBe(true));
  });

  it("deletes only the requested slot and preserves a sibling slot", async () => {
    vi.spyOn(calibrationService, "deleteDocumentation").mockResolvedValue(undefined);
    const withBefore: CalibrationDetail = {
      ...detail,
      parameters: [{
        ...detail.parameters[0],
        documentation: {
          ...detail.parameters[0].documentation,
          before: {
            id: "doc-before", calibrationDetailId: 54, parameterId: "7", photoType: "before",
            previewUrl: "https://api.test/before", mimeType: "image/webp", size: 20,
            uploadedAt: "2026-08-18T01:00:00.000Z",
          },
        },
      }],
    };
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["calibration", "cal-1"], withBefore);
    const { result } = renderHook(() => useDeleteCalibrationDocumentation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        calibrationId: "cal-1", detailId: 54, parameterId: "7", photoType: "before",
      });
    });

    const cached = queryClient.getQueryData<CalibrationDetail>(["calibration", "cal-1"]);
    expect(cached?.parameters[0].documentation.before).toBeUndefined();
    expect(cached?.parameters[0].documentation.after?.id).toBe("doc-after");
  });
});
