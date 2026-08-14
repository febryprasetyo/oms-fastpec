import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCalibrationAuth } from "./useCalibration";

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
