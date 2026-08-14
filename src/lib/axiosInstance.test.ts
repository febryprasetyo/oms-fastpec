import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteCookie, doLogout, toast } = vi.hoisted(() => ({
  deleteCookie: vi.fn(),
  doLogout: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/components/ui/use-toast", () => ({ toast }));
vi.mock("@/services/store", () => ({
  useAuthStore: { getState: () => ({ doLogout }) },
}));
vi.mock("cookies-next", () => ({ deleteCookie }));

import { axiosInstance } from "./axiosInstance";

const rejectWithResponse = (status: number, message: string) => () =>
  Promise.reject({ response: { status, data: { message } } });

describe("interceptor respons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan judul sesi berakhir dalam bahasa Indonesia untuk token tidak sah", async () => {
    await axiosInstance.get("/uji-401", {
      adapter: rejectWithResponse(401, "Access token expired or invalid"),
    });

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Sesi Berakhir",
      description: "Silakan masuk kembali untuk melanjutkan.",
    }));
  });

  it("menampilkan judul kesalahan umum dalam bahasa Indonesia", async () => {
    await expect(axiosInstance.get("/uji-500", {
      adapter: rejectWithResponse(500, "Layanan tidak tersedia"),
    })).rejects.toBeDefined();

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Kesalahan",
      description: "Layanan tidak tersedia",
    }));
  });
});
